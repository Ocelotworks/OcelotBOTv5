/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 10/05/2019
 * ╚════ ║   (ocelotbotv5) loadCommand
 *  ════╝
 */
module.exports = {
    name: "Load Command",
    usage: "loadCommand <command>",
    commands: ["loadcommand", "lc", "load", "reload", "reloadcommand", "rc"],
    init: function init(bot){
        if(bot.client.shard){
            bot.logger.log("Loading shard receiver for !admin loadCommand");
            process.on("message", function(msg){
                if(msg.type === "loadCommand") {
                    try {
                        bot.loadCommand(msg.message, true)
                    }catch(e){
                        bot.raven.captureException(e);
                        console.error(e);
                    }
                }
            });
        }
    },
    run: async function(message, args, bot){
        if(!args[2])
            return message.channel.send("You must enter a command file to load.");
        await bot.rabbit.event({type: "loadCommand", message: args[2]});
        bot.logger.log("Loading Command");
        message.channel.send("Loading command "+args[2]);
    }
};