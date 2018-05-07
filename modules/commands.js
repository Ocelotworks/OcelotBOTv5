const config = require('config');
const fs = require('fs');
const async = require('async');

module.exports = {
    name: "Commands",
    init: function(bot){
        bot.commandUsages = {};
        bot.commands = {};

        bot.client.on("message", async function onMessage(message) {
            const prefix = config.get("General.DefaultPrefix");
            const prefixLength = prefix.length;
            if(message.content.startsWith(prefix)){
                const args = message.content.split(" ");
                const command = args[0].substring(prefixLength);
                if(bot.commands[command]){
                    if(!bot.checkBan(message)) {
                        bot.logger.log(`${message.author.username} (${message.author.id}) in ${message.guild ? message.guild.name : "DM Channel"} (${message.guild ? message.guild.id : "DM Channel"}) performed command ${command}: ${message.content}`);
                        try {
                            bot.stats.commandsPerMinute++;
                            bot.stats.commandsTotal++;
                            if (bot.commandUsages[command].requiredPermissions) {
                                const permissions = await message.channel.permissionsFor(bot.client.user);
                                if (permissions.has(bot.commandUsages[command].requiredPermissions)) {
                                    bot.commands[command](message, args, bot);
                                } else if (permissions.has("SEND_MESSAGES")) {
                                    message.replyLang("ERROR_NEEDS_PERMISSION", bot.commandUsages[command].requiredPermissions.join(", "));
                                } else {
                                    bot.logger.log("No permission to send messages in this channel.");
                                }
                            } else {
                                bot.commands[command](message, args, bot);
                            }
                        } catch (e) {
                            message.reply(e.toString());
                        }
                    }else{
                        bot.logger.log(`${message.author.username} (${message.author.id}) in ${message.guild.name} (${message.guild.id}) attempted command but is banned: ${command}: ${message.content}`);
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

                        for (let i in loadedCommand.commands) {
                            if (loadedCommand.commands.hasOwnProperty(i)) {
                                const commandName = loadedCommand.commands[i];
                                bot.commands[commandName] = loadedCommand.run;
                                bot.commandUsages[commandName] = {
                                    name: loadedCommand.name,
                                    usage: loadedCommand.usage,
                                    requiredPermissions: loadedCommand.requiredPermissions,
                                    hidden: loadedCommand.hidden
                                };
                            }
                        }
                    }
                    callback();
                },()=> bot.logger.log("Finished loading commands."));
            }
        });
    }
};