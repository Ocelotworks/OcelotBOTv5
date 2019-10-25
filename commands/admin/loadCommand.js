/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 10/05/2019
 * ╚════ ║   (ocelotbotv5) loadCommand
 *  ════╝
 */
module.exports = {
    name: "Load Command",
    usage: "loadCommand <command>",
    commands: ["loadcommand", "lc"],
    init: function init(bot){
        if(bot.client.shard){
            bot.logger.log("Loading shard receiver for !admin loadCommand");
            process.on("message", function(msg){
                if(msg.type === "loadCommand")
                    bot.loadCommand(msg.message, true)
            });
        }
    },
    run: async function(message, args, bot){
        if(!args[2])
            return message.channel.send("You must enter a command file to load.");
        bot.client.shard.send({type: "loadCommand", message: args[2]});
        bot.logger.log("Loading Command");
    }
};