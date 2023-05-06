const fs = require('fs');
const Sentry = require('@sentry/node');

let checkTimer;

module.exports = {
    name: "Subscriptions",
    usage: "subscriptions",
    rateLimit: 10,
    categories: ["tools"],
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["subscriptions", "subscription", "subscribe", "sub", "subs"],
    guildOnly: true,
    subs: {},
    removedSubs: [],
    nestedDir: "subscriptions",
    init: async function(bot){
        bot.logger.log("Loading subscriptions...");
        bot.subscriptions = {};

        let options = [];

        await new Promise((fulfill)=>{
            fs.readdir(__dirname+"/../subscriptions", (err, files)=>{
                if(err){
                    bot.raven.captureException(err);
                    bot.logger.warn("Couldn't load subscriptions dir");
                    console.error(err);
                }else{
                    for(let i = 0; i < files.length; i++){
                        const file = `${__dirname}/../subscriptions/${files[i]}`;
                        try{
                            const sub = require(file);
                            if(sub.name){
                                bot.logger.log(`Loading ${sub.name}`);
                                if(sub.init)
                                    sub.init(bot);
                                bot.subscriptions[sub.id] = sub;
                                if(!sub.hidden)
                                    options.push({
                                        name: sub.id,
                                        description: sub.desc || sub.id,
                                        options: sub.slashOptions || [{type: "STRING", name: "data", description: "Data for this subscription", required: true}],
                                        type: 1
                                    })
                            }else{
                                bot.logger.warn(`Subscription ${file} is not valid`);
                            }
                        }catch(e){
                            bot.logger.warn(`Couldn't load subscription ${file} - ${e}`);
                        }
                    }
                }
                fulfill();
            });
        })

        bot.client.once("ready", async ()=>{
            // Patch the slash options haha
            const addCommand = this.slashOptions.findIndex((d)=>d.name === "add");
            this.slashOptions[addCommand] = {
                name: "add",
                description: "Add a subscription",
                options:  options,
                type: 2,
            };
            bot.logger.log("Loading active subscriptions...");
            const rawSubs = await bot.database.getSubscriptionsForShard([...bot.client.guilds.cache.keys()], bot.client.user.id);
            bot.logger.log(`Loaded ${rawSubs.length} subs`);
            for(let i = 0; i < rawSubs.length; i++){
                const sub = rawSubs[i];
                let failures = await bot.database.getFailureCount("subscription", sub.id);
                if(failures > 10){
                    bot.logger.warn(`Completely ignoring subscription ID ${sub.id} as it has ${failures} failures`);
                    continue
                }
                if(module.exports.subs[sub.data])
                    module.exports.subs[sub.data].push(sub);
                else
                    module.exports.subs[sub.data] = [sub];

                if(bot.subscriptions[sub.type] && bot.subscriptions[sub.type].added)
                    bot.subscriptions[sub.type].added(sub, bot);

            }
            if(checkTimer)
                clearInterval(checkTimer);
            checkTimer = setInterval(module.exports.check, 120000, bot);
        });

        bot.client.on("channelDelete", async function channelDeleted(channel){
            if(!channel.guild)return;
            await bot.database.removeSubscriptionsForChannel(channel.guild.id, channel.id, bot.client.user.id);
            for(let subType in bot.subscriptions){
                if(bot.subscriptions.hasOwnProperty(subType)) {
                    for (let i = 0; i < bot.subscriptions[subType].length; i++) {
                        if(bot.subscriptions[subType][i].channel === channel.id){
                            bot.subscriptions[subType].splice(i,1);
                            bot.logger.log(`Deleted ${subType} sub #${i} from deleted channel ${channel.id}`);
                        }
                    }
                }
            }
        })
    },
    handleFailures: function handleFailures(bot, sub, failures){
        if(failures < 3)return;
        // Timeout by 0.5 hours, 1.5 hours, 2.5 hours...
        const timeoutHours = failures-2.5
        bot.logger.warn(`Temporarily not checking ID ${sub.id} for ${timeoutHours} hours`);
        sub.timedOut = true;
        if(failures > 10){
            bot.logger.warn(`Just forgetting the sub entirely until the bot is restarted`);
            // TODO: remove completely
            return;
        }
        setTimeout(()=>{
            bot.logger.warn(`Resuming checks for ${sub.id}`);
            sub.timedOut = false;
        }, 3.6e+6*timeoutHours);
    },
    checkSubType: async function checkSubType(bot, subList){
        console.log("Checking sub");
        const sub = subList[0];
        if(subList.length === 1 && sub.timedOut || module.exports.removedSubs.includes(sub.id))return;
        let results = await bot.subscriptions[sub.type].check(sub.data, sub.lastcheck).catch(async (e)=>{
            let failures = await bot.database.logFailure("subscription", sub.id, e.message, sub.server, sub.channel, sub.user)
            module.exports.handleFailures(bot, sub, failures);
            return null;
        });
        try {
            await bot.database.updateLastCheck(sub.id);
        }catch(e){
            bot.logger.error(e);
        }
        sub.lastcheck = new Date();
        if(!results || results.length === 0){
            return
        }
        for (let i = 0; i < subList.length; i++) {
            const subChannel = subList[i];
            if(subChannel.timedOut || module.exports.removedSubs.includes(subChannel.id)){
                await bot.database.updateLastCheck(subChannel.id);
                subChannel.lastcheck = new Date();
                continue;
            }
            try {
                let chan = bot.client.channels.cache.get(subChannel.channel);
                await bot.database.updateLastCheck(subChannel.id);
                subChannel.lastcheck = new Date();
                if (chan && !chan.deleted && chan.permissionsFor(bot.client.user.id)?.has("SEND_MESSAGES")) {
                    let output = {embeds: results.slice(0, 10)};
                    if (results.length > 10)
                        output.content = `:warning: ${results.length - 10} results omitted.`;
                    await chan.send(output);
                } else {
                    let failures = await bot.database.logFailure("subscription", subChannel.id, "Channel not accessible", subChannel.server, subChannel.channel, subChannel.user)
                    module.exports.handleFailures(bot, subChannel, failures);
                    bot.logger.warn(`${subChannel.channel} does not exist for sub ${subChannel.id}`);
                }
            }catch(e){
                Sentry.captureException(e);
                let failures = await bot.database.logFailure("subscription", subChannel.id, e.message, subChannel.server, subChannel.channel, subChannel.user)
                module.exports.handleFailures(bot, subChannel, failures);
            }
        }
    },
    check: async function check(bot){
        if(bot.drain)return;
        for(let data in module.exports.subs)
           if(module.exports.subs.hasOwnProperty(data)){
               const subList = module.exports.subs[data];
               const sub = subList[0];
               if(bot.config.getBool("global", `subscriptions.${sub.type}.disable`)){
                   bot.logger.warn(`Skipping subscription ${sub.type} due to disable flag`)
                   continue;
               }
               if(bot.subscriptions[sub.type]){
                   if(!bot.subscriptions[sub.type].check)continue;
                   await module.exports.checkSubType(bot, subList);
               }else{
                   bot.logger.warn(`Invalid subscription type ${sub.type}`);
               }
           }
    },
};
