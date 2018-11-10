const fs = require('fs');
module.exports = {
    name: "Subscriptions",
    usage: "subscriptions add/list/remove",
    rateLimit: 10,
    categories: ["tools"],
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["subscriptions", "subscription", "subscribe", "sub", "subs"],
    init: async function(bot){
        bot.logger.log("Loading subscriptions...");
        bot.subscriptions = {};
        fs.readdir("subscriptions", function readDir(err, files){
           if(err){
               bot.raven.captureException(err);
               bot.logger.warn("Couldn't load subscriptions dir");
           }else{
               for(let i = 0; i < files.length; i++){
                   const file = `../subscriptions/${files[i]}`;
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
            const subs = await bot.database.getAllSubscriptions();
            for(let i = 0; i < subs.length; i++){
                const sub = subs[i];
                if(bot.client.guilds.has(sub.server)){
                    bot.logger.log(`Subscription ${sub.id} (${sub.type}) belongs to this shard.`);
                    if(bot.subscriptions[sub.type]){
                        bot.subscriptions[sub.type].added(sub.server, sub.channel, sub.user, sub.data, sub.lastcheck, bot);
                    }else{
                        bot.logger.warn(`${sub.type} failed to initialise and is needed!`);
                    }
                }
            }
        });
    },
    run: async function(message, args, bot){
        if(!message.guild){
            message.channel.send(":bangbang: This can't be used in a DM channel.");
            return;
        }
        if(!args[1]){
            message.channel.send(":bangbang: Usage: !subscriptions add/list/remove");
            return;
        }

        const action = args[1].toLowerCase();

        if(action === "add"){
            if(args[2] && bot.subscriptions[args[2]] && args[3]){
                await bot.database.addSubscription(message.guild.id, message.channel.id, message.author.id, args[2], args[3]);
                bot.subscriptions[args[2]].added(message.guild.id, message.channel.id, message.author.id, args[3], new Date(), bot);
                message.channel.send(":white_check_mark: Your subscription has been added! You will receive messages in this channel whenever there are updates.");
            }else{
                let output = "Usage: !subscription add name URL\nAvailable Subscriptions:\n";
                for(let sub in bot.subscriptions){
                    output += sub+" - "+bot.subscriptions[sub].name;
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
                message.channel.send("There are no subscriptions in this channel yet! Add one with !subscription add");
            }
        }else if(action === "remove"){
            if(!args[3] || isNaN(args[3])){
                message.channel.send(":bangbang: Usage !subscriptions remove ID where ID is the number listed on !subscriptions list");
            }else{

            }
        }else{
            message.channel.send(":bangbang: Usage: !subscriptions add/list/remove");
        }
    }
};