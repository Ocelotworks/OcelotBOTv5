const fs = require('fs');


let checkTimer;

module.exports = {
    name: "Subscriptions",
    usage: "subscriptions",
    rateLimit: 10,
    categories: ["tools"],
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["subscriptions", "subscription", "subscribe", "sub", "subs"],
    hidden: true,
    subs: {},
    removedSubs: [],
    nestedDir: "subscriptions",
    init: async function(bot){
        bot.logger.log("Loading subscriptions...");
        bot.subscriptions = {};
        fs.readdir(__dirname+"/../subscriptions", function readDir(err, files){
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
                       }else{
                           bot.logger.warn(`Subscription ${file} is not valid`);
                       }
                   }catch(e){
                       bot.logger.warn(`Couldn't load subscription ${file} - ${e}`);
                   }
               }
           }
        });
        bot.client.once("ready", async function discordReady(){
            bot.logger.log("Loading active subscriptions...");
            const rawSubs = await bot.database.getSubscriptionsForShard(bot.client.guilds.cache.keyArray(), bot.client.user.id);
            bot.logger.log(`Loaded ${rawSubs.length} subs`);
            for(let i = 0; i < rawSubs.length; i++){
                const sub = rawSubs[i];
                if(module.exports.subs[sub.data])
                    module.exports.subs[sub.data].push(sub);
                else
                    module.exports.subs[sub.data] = [sub];

                if(bot.subscriptions[sub.type] && bot.subscriptions[sub.type].added)
                    bot.subscriptions[sub.type].added(sub, bot);

            }
            if(checkTimer)
                clearInterval(checkTimer);
            checkTimer = setInterval(module.exports.check, 60000, bot);
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
    check: async function check(bot){
        if(bot.drain)return;
        for(let data in module.exports.subs)
           if(module.exports.subs.hasOwnProperty(data)){
               const subList = module.exports.subs[data];
               const sub = subList[0];
               if(module.exports.removedSubs.includes(sub.id))continue;
               if(bot.subscriptions[sub.type]){
                   if(!bot.subscriptions[sub.type].check)continue;
                    let results = await bot.subscriptions[sub.type].check(sub.data, sub.lastcheck);
                    if(!results || results.length === 0)continue;
                    for (let i = 0; i < subList.length; i++) {
                       let chan = bot.client.channels.cache.get(subList[i].channel);
                        await bot.database.updateLastCheck(subList[i].id);
                        subList[i].lastcheck = new Date();
                       if(chan) {
                           console.log(JSON.stringify(results))
                           chan.send({embeds: [results]});
                       }else {
                           bot.logger.warn(`${subList[i].channel} does not exist for sub ${subList[i].id}`);
                       }
                   }
               }else{
                   bot.logger.warn(`Invalid subscription type ${sub.type}`);
               }
           }
    },
};