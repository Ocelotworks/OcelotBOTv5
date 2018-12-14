const config = require('config');
const fs = require('fs');
const async = require('async');

module.exports = {
    name: "Commands",
    init: function (bot) {
        bot.commandUsages = {};
        bot.commands = {};
        bot.rateLimits = {};
        bot.prefixCache = {};
        bot.client.on("message", bot.raven.wrap(async function onMessage(message) {
            if(message.author.bot)return;
            const prefix = message.getSetting("prefix");
            const prefixLength = prefix.length;
            if (message.content.startsWith(prefix)) {
                const args = message.content.split(" ");
                const command = args[0].substring(prefixLength).toLowerCase();
                if (bot.commands[command]) {
                    if(message.getSetting(`${command}.disable`))
                        return bot.logger.log(`${command} is disabled in this server.`);
                    const channelDisable = message.getSetting(`${command}.channelDisable`);
                    if(channelDisable && channelDisable.indexOf(message.channel.id) > -1){
                        if(message.getSetting("sendDisabledMessage") === "true") {
                            const dm = await message.author.createDM();
                            dm.send(`${command} is disabled in that channel`);
                            bot.logger.log(`${command} is disabled in that channel (${message.channel.id})`);
                        }
                        return;
                    }
                    for(let i = 0; i < args.length; i++){
                        if(!args[i]){
                            bot.logger.log("Removing argument "+i);
                            args.splice(i, 1);
                        }
                    }
                    if (bot.checkBan(message)) {
                        bot.bus.emit("commandRatelimited", command, message);
                        bot.logger.log(`${message.author.username} (${message.author.id}) in ${message.guild.name} (${message.guild.id}) attempted command but is banned: ${command}: ${message.content}`);
                    } else if (!bot.rateLimits[message.author.id] || bot.rateLimits[message.author.id] < 100) {
                        bot.bus.emit("commandPerformed", command, message);
                        bot.logger.log(`${message.author.username} (${message.author.id}) in ${message.guild ? message.guild.name : "DM Channel"} (${message.guild ? message.guild.id : "DM Channel"}) performed command ${command}: ${message.content}`);
                        try {
                            bot.raven.captureBreadcrumb({
                                user: {
                                    username: message.author.username,
                                    id: message.author.id
                                },
                                message: message.content,
                                channel: message.channel.id,
                                server: message.guild ? message.guild.id : "DM Channel"
                            });
                            if (message.channel.permissionsFor && bot.commandUsages[command].requiredPermissions) {
                                bot.stats.time("commandGetPermissions");
                                const permissions = await message.channel.permissionsFor(bot.client.user);
                                bot.stats.time("commandGetPermissions");
                                if (permissions.has(bot.commandUsages[command].requiredPermissions)) {
                                    bot.commands[command](message, args, bot);
                                } else if (permissions.has("SEND_MESSAGES")) {
                                    message.replyLang("ERROR_NEEDS_PERMISSION", bot.commandUsages[command].requiredPermissions.join(", "));
                                } else {
                                    const dm = await message.author.createDM();
                                    dm.send("I don't have permission to send messages in that channel.");
                                    bot.logger.log("No permission to send messages in this channel.");
                                }
                            } else {
                                bot.commands[command](message, args, bot);
                            }
                            bot.rateLimits[message.author.id] += bot.commandUsages[command].rateLimit || 1;
                        } catch (e) {
                            message.channel.stopTyping(true);
                            message.reply(e.toString());
                            console.log(e);
                            bot.raven.captureException(e);
                        } finally {
                            bot.database.logCommand(message.author.id, message.channel.id, message.content).catch(function (e) {
                                bot.raven.captureException(e);
                                bot.logger.error(e);
                            });
                        }
                    } else if(bot.rateLimits[message.author.id] < message.getSetting("rateLimit.threshold")) {
                        bot.logger.log(`${message.author.username} (${message.author.id}) in ${message.guild.name} (${message.guild.id}) attempted command but is ratelimited: ${command}: ${message.content}`);
                        message.reply("You're doing too many commands. Wait a while before your next command.");
                        bot.rateLimits[message.author.id] += bot.commandUsages[command].rateLimit || 1;
                    }else{
                        console.log(bot.rateLimits[message.author.id]);
                        bot.logger.log(`${message.author.username} (${message.author.id}) in ${message.guild.name} (${message.guild.id}) attempted command but is ratelimited: ${command}: ${message.content}`);
                    }
                }
            }
        }));

        setInterval(function(){
            bot.rateLimits = {};
        }, 60000);


        module.exports.loadPrefixCache(bot);
        module.exports.loadCommands(bot);
    },
    loadPrefixCache: async function(bot){

        const prefixes = await bot.database.getPrefixes();
        for(let i = 0; i < prefixes.length; i++){
            const prefix = prefixes[i];
            bot.prefixCache[prefix.server] = prefix.prefix;
        }
        bot.logger.log("Populated prefix cache with "+Object.keys(bot.prefixCache).length+" servers");
    },
    loadCommands: function (bot) {
        fs.readdir("commands", function readCommands(err, files) {
            if (err) {
                bot.logger.error("Error reading from commands directory");
                bot.logger.error(err);
                bot.raven.captureException(err);
            } else {
                async.eachSeries(files, function loadCommands(command, callback) {
                    if (!fs.lstatSync("commands/" + command).isDirectory()) {
                        let loadedCommand = require("../commands/" + command);
                        if (loadedCommand.init)
                            loadedCommand.init(bot);
                        bot.logger.log(`Loaded command ${loadedCommand.name}`);

                        for (let i in loadedCommand.commands) {
                            if (loadedCommand.commands.hasOwnProperty(i)) {
                                const commandName = loadedCommand.commands[i];
                                bot.commands[commandName] = loadedCommand.run;
                                    bot.commandUsages[commandName] = {
                                        id: command,
                                        name: loadedCommand.name,
                                        usage: loadedCommand.usage,
                                        requiredPermissions: loadedCommand.requiredPermissions,
                                        hidden: loadedCommand.hidden,
                                        categories: loadedCommand.categories
                                    };

                            }
                        }
                    }
                    callback();
                }, function commandLoadFinished() {
                    bot.bus.emit("commandLoadFinished");
                    bot.logger.log("Finished loading commands.");

                    bot.client.shard.send({
                        type: "commandList",
                        payload: bot.commandUsages
                    })
                });
            }
        });
    }
};