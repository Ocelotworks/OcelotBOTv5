const config = require('config');
const fs = require('fs');
const async = require('async');

module.exports = {
    name: "Commands",
    init: function(bot){
        bot.commandUsages = {};
        bot.commands = {};

        bot.client.on("message", function onMessage(message) {
            const prefix = config.get("General.DefaultPrefix");
            const prefixLength = prefix.length;
            if(message.content.startsWith(prefix)){
                const args = message.content.split(" ");
                const command = args[0].substring(prefixLength);
                if(bot.commands[command]){
                    bot.logger.log(`${message.author.username} (${message.author.id}) in ${message.guild.name} (${message.guild.id}) performed command ${command}: ${message.content}`);
                    try {
                        bot.commands[command](message, args, bot);
                    }catch(e){
                        message.reply(e.toString());
                    }
                }
            }
        });

        module.exports.loadCommands(bot);
    },
    loadCommands: function(bot){
        fs.readdir("commands", function readCommands(err, files){
            if(err){
                bot.logger.error("Error reading from commands directory");
                bot.logger.error(err);
                bot.raven.captureException(err);
            }else{
                async.eachSeries(files, function loadCommands(command, callback){
                    if(!fs.lstatSync("commands/" + command).isDirectory()) {
                        let loadedCommand = require("../commands/" + command);
                        if (loadedCommand.init)
                            loadedCommand.init(bot);
                        bot.logger.log(`Loaded command ${loadedCommand.name}`);
                        bot.commandUsages[loadedCommand.name] = {
                            usage: loadedCommand.usage,
                            accessLevel: loadedCommand.accessLevel,
                            receivers: loadedCommand.receivers,
                            hidden: loadedCommand.hidden
                        };
                        for (let i in loadedCommand.commands) {
                            if (loadedCommand.commands.hasOwnProperty(i)) {
                                bot.commands[loadedCommand.commands[i]] = loadedCommand.run;
                            }
                        }
                    }
                    callback();
                },()=> bot.logger.log("Finished loading commands."));
            }
        });
    }
};