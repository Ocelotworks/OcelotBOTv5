const fs = require('fs');

let subs = {
};
let checkTimer;

module.exports = {
    name: "Subscriptions",
    usage: "subscriptions add/list/remove/types",
    rateLimit: 10,
    categories: ["tools"],
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["subscriptions", "subscription", "subscribe", "sub", "subs"],
    hidden: true,
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
        bot.client.on("ready", async function discordReady(){
            bot.logger.log("Loading active subscriptions...");
            const rawSubs = await bot.database.getSubscriptionsForShard(bot.client.guilds.keyArray());
            console.log(rawSubs);
            bot.logger.log(`Loaded ${rawSubs.length} subs`);
            for(let i = 0; i < rawSubs.length; i++){
                const sub = rawSubs[i];
                if(subs[sub.data])
                    subs[sub.data].push(sub);
                else
                    subs[sub.data] = [sub];

                if(bot.subscriptions[sub.type] && bot.subscriptions[sub.type].added)
                    bot.subscriptions[sub.type].added(sub);

            }
            if(checkTimer)
                clearInterval(checkTimer);
            checkTimer = setInterval(module.exports.check, 60000, bot);
        });
    },
    check: async function check(bot){
       for(let data in subs)
           if(subs.hasOwnProperty(data)){
               const subList = subs[data];
               const sub = subList[0];
               if(bot.subscriptions[sub.type]){
                    let results = await bot.subscriptions[sub.type].check(sub.data, sub.lastcheck);
                    if(!results || results.length === 0)continue;
                    for (let i = 0; i < subList.length; i++) {
                       let chan = bot.client.channels.get(subList[i].channel);
                        await bot.database.updateLastCheck(subList[i].id);
                        subList[i].lastcheck = new Date();
                       if(chan) {
                           for(let j = 0; j < results.length; j++) {
                               let result = results[j];
                               bot.logger.log(`Sending result for ${sub.type} ID ${sub.id} to ${subList.length} channels.`);
                                if(j >= 5){
                                    chan.send(`:warning: **${results.length-5}** more results were omitted.`);
                                    break;
                                }else{
                                    chan.send("", result);
                                }
                           }
                       }else {
                           bot.logger.warn(`${subList[i].channel} does not exist for sub ${subList[i].id}`);
                       }
                   }
               }else{
                   bot.logger.warn(`Invalid subscription type ${sub.type}`);
               }
           }
    },
    run: async function(message, args, bot){
        if(!message.guild){
            message.channel.send(":bangbang: This can't be used in a DM channel.");
            return;
        }
        if(!args[1]){
            message.channel.send(`:bangbang: Usage: ${args[0]} add/list/remove`);
            return;
        }

        const action = args[1].toLowerCase();

        if(action === "add" || action === "types"){
            if(args[2] && bot.subscriptions[args[2]] && args[3]){
                let validation = bot.subscriptions[args[2]].validate(args[3]);
                if(validation)
                    return message.channel.send(validation);
                let res = await bot.database.addSubscription(message.guild.id, message.channel.id, message.author.id, args[2], args[3]);
                let subObject = {
                    server: message.guild.id,
                    channel: message.channel.id,
                    user: message.author.id,
                    type: args[2],
                    data: args[3],
                    lastcheck: new Date().getTime(),
                    id: res[0]
                };
                if(subs[subObject.data]){
                    subs[subObject.data].push(subObject);
                }else{
                    subs[subObject.data] = [subObject];
                }
                message.channel.send(":white_check_mark: Your subscription has been added! You will receive messages in this channel whenever there are updates.");
                if(bot.subscriptions[args[2]].added)
                    bot.subscriptions[args[2]].added(subObject);

            }else{
                let output = "Usage: !subscription add name URL\nAvailable Subscriptions:\n";
                for(let sub in bot.subscriptions){
                    output += sub+" - "+bot.subscriptions[sub].name+"\n";
                }
                message.channel.send(output);
            }
        }else if(action === "list"){
            const subs = await bot.database.getSubscriptionsForChannel(message.channel.id);
            if(subs.length > 0){
                let output = `Active subscriptions for **#${message.channel.name}**:\n`;
                for(let i = 0; i < subs.length; i++){
                    const sub = subs[i];
                    output += `${sub.id}: ${sub.type} - ${sub.data}\n`
                }
                message.channel.send(output);
            }else{
                message.channel.send(`There are no subscriptions in this channel yet! Add one with ${args[0]} add\nor view available subscription types with **${args[0]} types**`);
            }
        }else if(action === "remove"){
            if(!args[3] || isNaN(args[3])){
                message.channel.send(`:bangbang: Usage !subscriptions remove ID where ID is the number listed on ${args[0]} list`);
            }else{
                message.channel.send("NYI, shout at peter");
            }
        }else{
            message.channel.send(`:bangbang: Usage: ${args[0]} add/list/remove`);
        }
    }
};