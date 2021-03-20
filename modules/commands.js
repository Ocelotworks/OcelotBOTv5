const fs = require('fs');
const Sentry = require('@sentry/node');
const {crc32} = require('crc');

module.exports = {
    name: "Commands",
    init: function (bot) {

        bot.commandObjects = {};
        bot.commandUsages = {};
        bot.commands = {};

        bot.prefixCache = {};

        bot.customCommands = {};

        process.on('exit', async (code) => {
            bot.logger.log("Process close requested", code);
            bot.drain = true;
            for (let command in bot.commandObjects) {
                if (bot.commandObjects.hasOwnProperty(command) && bot.commandObjects[command].shutdown) {
                    bot.logger.log("Shutting down ", command);
                    await bot.commandObjects[command].shutdown(bot);
                }
            }
        })

        bot.client.on("ready", async ()=>{
            let commands = await bot.database.getCustomCommandsForShard(bot.client.guilds.cache.keyArray());
            for(let i = 0; i < commands.length; i++){
                const command = commands[i];
                if(bot.customCommands[command.server])
                    bot.customCommands[command.server][command.trigger] = command.function;
                else
                    bot.customCommands[command.server] = {[command.trigger]: command.function};
            }
        })

        bot.client.on("message", function onMessage(message) {
            if (bot.drain || message.author.bot) return;
            Sentry.configureScope(async function onMessage(scope) {
                scope.setUser({
                    username: message.author.username,
                    id: message.author.id
                });
                const prefix = message.getSetting("prefix");
                if (!prefix) return;//Bot hasn't fully loaded
                const prefixLength = prefix.length;
                if (!message.content.startsWith(prefix))
                    return;
                const args = message.content.split(/ +/g);
                const command = args[0].substring(prefixLength).toLowerCase();
                if (!bot.commands[command]) {
                    if(!message.guild || !bot.customCommands[message.guild.id])return;
                    let customCommand = bot.customCommands[message.guild.id][command]
                    bot.logger.log({
                        type: "commandPerformed",
                        command: {
                            name: command,
                            id: "custom-"+command,
                            content: message.content,
                        },
                        message: bot.util.serialiseMessage(message),
                    })
                    return await bot.util.runCustomFunction(customCommand, message)
                }

                bot.logger.log({
                    type: "commandPerformed",
                    command: {
                        name: command,
                        id: bot.commandUsages[command].id,
                        content: message.content,
                    },
                    message: bot.util.serialiseMessage(message),
                })
                //bot.logger.log(`${message.author.username} (${message.author.id}) in ${message.guild ? message.guild.name : "DM Channel"} (${message.guild ? message.guild.id : "DM Channel"}) ${message.channel.name} (${message.channel.id}) performed command ${command}: ${message.content}`);
                let span = bot.util.startSpan("Fetch Command Usage")
                let commandUsage = bot.commandUsages[command];
                span.end();

                message.channel.stopTyping();
                if (commandUsage.vote && message.getBool("voteRestrictions") && !(message.getBool("premium") || message.getBool("serverPremium"))) {
                    if (message.getSetting("restrictionType") === "vote") {
                        span = bot.util.startSpan("Get last vote time")
                        let lastVote = await bot.database.getLastVote(message.author.id);
                        if (lastVote[0])
                            lastVote = lastVote[0]['MAX(timestamp)'];

                        let difference = new Date() - lastVote;
                        console.log("difference is " + difference);
                        if (difference > bot.util.voteTimeout * 2) {
                            span.end("Vote Required");
                            return message.replyLang("COMMAND_VOTE_REQUIRED")
                        }
                        span.end();
                    } else {
                        span = bot.util.startSpan("Fetch user in support server");
                        // This is dumb, but I can't avoid this
                        try {
                            await (await bot.client.guilds.fetch("322032568558026753")).members.fetch(message.author.id)
                            span.end();
                        } catch (e) {
                            span.end("Not in support server");
                            return message.channel.send("You must join the support server or purchase premium to enable this command. You can join the support server here: https://discord.gg/PTaXZmE")
                        }
                    }
                }

                if (commandUsage.premium && !(message.getBool("premium") || message.getBool("serverPremium"))) {
                    span.end("Requires premium");
                    return message.channel.send(`:warning: This command requires **<:ocelotbot:533369578114514945> OcelotBOT Premium**\n_To learn more about premium, type ${message.getSetting("prefix")}premium_\nAlternatively, you can disable this command using ${message.getSetting("prefix")}settings disableCommand ${command}`);
                }

                if (message.getBool("allowNSFW") && commandUsage.categories.indexOf("nsfw") > -1) {
                    span.end("NSFW Disabled");
                    return bot.logger.log(`NSFW commands are disabled in this server (${message.guild.id}): ${message}`);
                }

                if (message.guild && !message.channel.nsfw && commandUsage.categories.indexOf("nsfw") > -1) {
                    span.end("NSFW Channel required")
                    return message.channel.send(`:warning: This command can only be used in NSFW channels.`);
                }

                if (message.getBool(`${command}.disable`)) {
                    span.end("Command disabled");
                    return bot.logger.log(`${command} is disabled in this server: ${message}`);
                }

                if (message.getSetting(`${command}.override`)) {
                    span.end("Command override")
                    return message.channel.send(message.getSetting(`${command}.override`));
                }

                if (message.getBool("wholesome")) {
                    if (commandUsage.categories.indexOf("nsfw") > -1 || commandUsage.unwholesome) {
                        span.end("Wholesome mode enabled - unwholesome command")
                        return message.channel.send(":star:  This command is not allowed in wholesome mode!");
                    }
                    if (bot.util.swearRegex.exec(message.content)) {
                        span.end("Wholesome mode enabled - swearing")
                        return message.channel.send("No swearing!");
                    }
                }

                const channelDisable = message.getSetting(`${command}.channelDisable`);
                if (channelDisable && channelDisable.indexOf(message.channel.id) > -1) {
                    span.end("Channel disabled")
                    if (message.getBool("sendDisabledMessage")) {
                        const dm = await message.author.createDM();
                        dm.send(`${command} is disabled in that channel`);
                        //TODO: COMMAND_DISABLED_CHANNEL
                        bot.logger.log(`${command} is disabled in that channel (${message.channel.id})`);
                    }
                    return;
                }
                const channelRestriction = message.getSetting(`${command}.channelRestriction`);
                if (channelRestriction && channelRestriction.indexOf(message.channel.id) === -1) {
                    span.end("Channel restricted")
                    if (message.getBool("sendDisabledMessage")) {
                        const dm = await message.author.createDM();
                        dm.send(`${command} is disabled in that channel`);
                        //TODO: COMMAND_DISABLED_CHANNEL
                        bot.logger.log(`${command} is disabled in that channel (${message.channel.id})`);
                    }
                    return;
                }
                if (bot.checkBan(message)) {
                    span.end("User banned")
                    return bot.logger.log(`${message.author.username} (${message.author.id}) in ${message.guild.name} (${message.guild.id}) attempted command but is banned: ${command}: ${message.content}`);
                }

                if (bot.isRateLimited(message.author.id, message.guild ? message.guild.id : "global")) {
                    bot.bus.emit("commandRatelimited", command, message);
                    if (bot.rateLimits[message.author.id] < message.getSetting("rateLimit.threshold")) {
                        console.log(bot.rateLimits[message.author.id]);
                        bot.logger.warn(`${message.author.username} (${message.author.id}) in ${message.guild ? message.guild.name : "DM"} (${message.guild ? message.guild.id : message.channel.id}) was ratelimited`);
                        const now = new Date();
                        const timeDifference = now - bot.lastRatelimitRefresh;
                        let timeLeft = 60000 - timeDifference;
                        message.replyLang("COMMAND_RATELIMIT", {timeLeft: bot.util.prettySeconds(timeLeft / 1000, message.guild && message.guild.id, message.author.id)});
                        bot.rateLimits[message.author.id] += bot.commandUsages[command].rateLimit || 1;
                    } else {
                        console.log(bot.rateLimits[message.author.id]);
                        bot.logger.warn(`${message.author.username} (${message.author.id}) in ${message.guild ? message.guild.name : "DM"} (${message.guild ? message.guild.id : message.channel.id}) was ratelimited`);
                    }
                    span.end("Ratelimited")
                    return;
                }

                span = bot.util.startSpan("Metrics tracking");
                bot.bus.emit("commandPerformed", command, message);
                scope.addBreadcrumb({
                    category: "Command",
                    level: Sentry.Severity.Info,
                    message: message.content,
                    data: {
                        username: message.author.username,
                        id: message.author.id,
                        message: message.content,
                        channel: message.channel.id,
                        server: message.guild ? message.guild.id : "DM Channel"
                    }
                });
                span.end();

                try {
                    span = bot.util.startSpan("Send notice")
                    if (message.getSetting("notice")) {
                        message.channel.send(message.getSetting("notice"));
                        bot.database.deleteSetting(message.guild.id, "notice");
                        if (bot.config.cache[message.guild.id])
                            bot.config.cache[message.guild.id].notice = null;
                    }
                    span.end();

                    if (message.channel.permissionsFor) {
                        span = bot.util.startSpan("Get channel permissions");
                        const permissions = await message.channel.permissionsFor(bot.client.user);
                        span.end();

                        if (!permissions || !permissions.has("SEND_MESSAGES")) {
                            bot.logger.log({
                                type: "commandPerformed",
                                success: false,
                                outcome: "No Permissions"
                            })
                            span = bot.util.startSpan("Create DM Channel");
                            const dm = await message.author.createDM();
                            span.end();
                            dm.send(":warning: I don't have permission to send messages in that channel.");
                            //TODO: COMMAND_NO_PERMS lang key
                            span.end("No permissions");
                            return;
                        }

                        span = bot.util.startSpan("Calculate permissions");
                        if (bot.commandUsages[command].requiredPermissions && !permissions.has(bot.commandUsages[command].requiredPermissions)) {
                            let permission = "";
                            for (let i = 0; i < bot.commandUsages[command].requiredPermissions.length; i++) {
                                permission += bot.util.permissionsMap[bot.commandUsages[command].requiredPermissions[i]];
                                if (i < bot.commandUsages[command].requiredPermissions.length - 1)
                                    permission += ", ";
                            }
                            span.end();
                            span.end("Missing permission");
                            return message.replyLang("ERROR_NEEDS_PERMISSION", {permission});
                        }
                        span.end();
                    }

                    span = bot.util.startSpan("Run command logic");
                    await bot.commands[command](message, args, bot);
                    span.end();
                    span.end("Success");
                } catch (e) {
                    message.channel.stopTyping(true);
                    message.channel.send("Something went horribly wrong. Try again later.");
                    console.log(e);
                    bot.bus.emit("commandFailed", e);
                    bot.raven.captureException(e);
                    span.end("Exception");
                } finally {
                    bot.database.logCommand(message.author.id, message.channel.id, message.guild ? message.guild.id : message.channel.id, message.id, command, message.content).catch(function (e) {
                        Sentry.captureException(e);
                        bot.logger.error(e);
                    })
                }
            });
        });


        bot.loadCommand = function loadCommand(command, reload) {
            try {
                const module = `${__dirname}/../commands/${command}`;
                if (reload) {
                    delete require.cache[require.resolve(module)];
                }
                let crc = crc32(fs.readFileSync(module, 'utf8')).toString(16);
                let loadedCommand = require(module);
                if (loadedCommand.init && !reload) {
                    try {
                        loadedCommand.init(bot);
                    } catch (e) {
                        Sentry.captureException(e);
                        bot.logger.error(e);
                        if (bot.client && bot.client.shard) {
                            bot.rabbit.event({
                                type: "warning", payload: {
                                    id: "badInit-" + command,
                                    message: `Couldn't initialise command ${command}:\n${e.message}`
                                }
                            });
                        }
                    }
                } else if (loadedCommand.init) {
                    bot.logger.warn(`Command ${command} was reloaded, but init was not run.`);
                }
                bot.logger.log(`Loaded command ${loadedCommand.name} ${`(${crc})`.gray}`);

                if (reload) {
                    if (bot.commandUsages[loadedCommand.commands[0]]) {
                        let oldCrc = bot.commandUsages[loadedCommand.commands[0]].crc;
                        if (oldCrc !== crc)
                            bot.logger.log(`Command ${command} version has changed from ${oldCrc} to ${crc}.`);
                        else
                            bot.logger.warn(`Command ${command} was reloaded but remains the same version.`);
                    }
                }

                bot.commandObjects[command] = loadedCommand;

                for (let i in loadedCommand.commands) {
                    if (loadedCommand.commands.hasOwnProperty(i)) {
                        const commandName = loadedCommand.commands[i];
                        if (bot.commands[commandName] && !reload) {
                            bot.rabbit.event({
                                type: "warning",
                                payload: {
                                    id: "commandOverwritten-" + commandName,
                                    message: `Command ${commandName} already exists as '${bot.commandUsages[commandName].id}' and is being overwritten by ${command}!`
                                }
                            })
                        }
                        bot.commands[commandName] = bot.commandObjects[command].run;
                        bot.commandUsages[commandName] = {
                            id: command,
                            crc,
                            ...loadedCommand,
                        };
                    }
                }
            } catch (e) {
                bot.logger.error("failed to load command", e);
            }
        };

        // module.exports.loadPrefixCache(bot);
        module.exports.loadCommands(bot);
    },
    loadPrefixCache: async function (bot) {
        const prefixes = await bot.database.getPrefixes();
        for (let i = 0; i < prefixes.length; i++) {
            const prefix = prefixes[i];
            bot.prefixCache[prefix.server] = prefix.prefix;
        }
        bot.logger.log("Populated prefix cache with " + Object.keys(bot.prefixCache).length + " servers");
    },
    loadCommands: function (bot) {
        fs.readdir(`${__dirname}/../commands`, function readCommands(err, files) {
            if (err) {
                bot.logger.error("Error reading from commands directory");
                console.error(err);
                Sentry.captureException(err);
            } else {
                for (const command of files) {
                    if (!fs.lstatSync(`${__dirname}/../commands/${command}`).isDirectory()) {
                        bot.loadCommand(command);
                    }
                }
                bot.bus.emit("commandLoadFinished");
                bot.logger.log("Finished loading commands.");

                bot.client.once("ready", () => {
                    bot.rabbit.event({
                        type: "commandList",
                        payload: bot.commandUsages
                    })
                })
            }
        });
    }
};