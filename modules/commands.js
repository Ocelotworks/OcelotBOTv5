const fs = require('fs');
const async = require('async');
const Sentry = require('@sentry/node');
module.exports = {
    name: "Commands",
    init: function (bot) {
        bot.commandUsages = {};
        bot.commands = {};

        bot.prefixCache = {};

        bot.client.on("message",function onMessage(message) {
            if(message.author.bot)return;
            Sentry.configureScope(async function onMessage(scope){
                scope.setUser({
                    username: message.author.username,
                    id: message.author.id
                });
                const prefix = message.getSetting("prefix");
                if(!prefix)return;//Bot hasn't fully loaded
                const prefixLength = prefix.length;
                if(!message.content.startsWith(prefix))
                    return;
                const args = message.content.split(/ +/g);
                const command = args[0].substring(prefixLength).toLowerCase();
                if(!bot.commands[command])
                    return;
                const span = bot.tracer.startSpan('command.performed');
                span.setTag('user.name', message.author.username);
                span.setTag('user.id', message.author.id);
                span.setTag('command.name', command);
                bot.logger.log(`${message.author.username} (${message.author.id}) in ${message.guild ? message.guild.name : "DM Channel"} (${message.guild ? message.guild.id : "DM Channel"}) ${message.channel.name} (${message.channel.id}) performed command ${command}: ${message.content}`);

                let commandUsage = bot.commandUsages[command];

                if(commandUsage.vote && message.getBool("voteRestrictions") && !(message.getBool("premium") || message.getBool("serverPremium"))){
                    console.log("Command requires vote");
                    let lastVote = await bot.database.getLastVote(message.author.id);
                    if(lastVote[0])
                        lastVote = lastVote[0]['MAX(timestamp)'];

                    let difference = new Date()-lastVote;
                    console.log("difference is "+difference);
                    if(difference > bot.util.voteTimeout*2) {
                        span.setTag('command.outcome', 'Vote Required');
                        span.finish();
                        return message.replyLang("COMMAND_VOTE_REQUIRED")
                    }
                }

                if(commandUsage.premium && !(message.getBool("premium") || message.getBool("serverPremium"))) {
                    span.setTag('command.outcome', 'Premium Required');
                    span.finish();
                    return message.channel.send(`:warning: This command requires **<:ocelotbot:533369578114514945> OcelotBOT Premium**\n_To learn more about premium, type \\${message.getSetting("prefix")}premium_\nAlternatively, you can disable this command using \\${message.getSetting("prefix")}settings disableCommand ${command}`);
                }

                if(message.getBool("allowNSFW") && commandUsage.categories.indexOf("nsfw") > -1) {
                    span.setTag('command.outcome', 'NSFW Disabled');
                    span.finish();
                    return bot.logger.log(`NSFW commands are disabled in this server (${message.guild.id}): ${message}`);
                }

                if(message.guild && !message.channel.nsfw && commandUsage.categories.indexOf("nsfw") > -1) {
                    span.setTag('command.outcome', 'NSFW Channel Required');
                    span.finish();
                    if(message.getBool("bypassNSFWCheck"))
                        return message.channel.send(`:warning: This command can only be used in NSFW channels.\nSorry, Discord Terms of Service changes mean I can no longer allow you to use NSFW commands outside of NSFW channels.`);
                    return message.channel.send(`:warning: This command can only be used in NSFW channels.`);
                }

                if(message.getBool(`${command}.disable`)) {
                    span.setTag('command.outcome', 'Command Disabled');
                    span.finish();
                    return bot.logger.log(`${command} is disabled in this server: ${message}`);
                }

                if(message.getSetting(`${command}.override`)) {
                    span.setTag('command.outcome', 'Command Overridden');
                    span.finish();
                    return message.channel.send(message.getSetting(`${command}.override`));
                }

                if(message.getBool("wholesome")){
                    if(commandUsage.categories.indexOf("nsfw") > -1 || commandUsage.unwholesome){
                        span.setTag('command.outcome', 'Wholesome Mode Enabled');
                        span.finish();
                        return message.channel.send(":star:  This command is not allowed in wholesome mode!");
                    }
                    if(bot.util.swearRegex.exec(message.content)) {
                        span.setTag('command.outcome', 'Wholesome Mode Swearing');
                        span.finish();
                        return message.channel.send("No swearing!");
                    }
                }

                const channelDisable = message.getSetting(`${command}.channelDisable`);
                if(channelDisable && channelDisable.indexOf(message.channel.id) > -1){
                    if(message.getBool("sendDisabledMessage")) {
                        const dm = await message.author.createDM();
                        dm.send(`${command} is disabled in that channel`);
                        //TODO: COMMAND_DISABLED_CHANNEL
                        bot.logger.log(`${command} is disabled in that channel (${message.channel.id})`);
                    }
                    span.setTag('command.outcome', 'Channel Disabled');
                    span.finish();
                    return;
                }
                const channelRestriction = message.getSetting(`${command}.channelRestriction`);
                if(channelRestriction && channelRestriction.indexOf(message.channel.id) === -1){
                    if(message.getBool("sendDisabledMessage")) {
                        const dm = await message.author.createDM();
                        dm.send(`${command} is disabled in that channel`);
                        //TODO: COMMAND_DISABLED_CHANNEL
                        bot.logger.log(`${command} is disabled in that channel (${message.channel.id})`);
                    }
                    span.setTag('command.outcome', 'Channel Restricted');
                    span.finish();
                    return;
                }
                if(bot.checkBan(message)) {
                    span.setTag('command.outcome', 'User Banned');
                    span.finish();
                    return bot.logger.log(`${message.author.username} (${message.author.id}) in ${message.guild.name} (${message.guild.id}) attempted command but is banned: ${command}: ${message.content}`);
                }

                if(bot.isRateLimited(message.author.id, message.guild ? message.guild.id : "global")){
                    bot.bus.emit("commandRatelimited", command, message);
                    if(bot.rateLimits[message.author.id] < message.getSetting("rateLimit.threshold")) {
                        console.log(bot.rateLimits[message.author.id]);
                        bot.logger.warn(`${message.author.username} (${message.author.id}) in ${message.guild.name} (${message.guild.id}) was ratelimited`);
                        const now = new Date();
                        const timeDifference = now-bot.lastRatelimitRefresh;
                        let timeLeft = 60000-timeDifference;
                        message.replyLang("COMMAND_RATELIMIT", {timeLeft: bot.util.prettySeconds(timeLeft/1000)});
                        bot.rateLimits[message.author.id] += bot.commandUsages[command].rateLimit || 1;
                    }else{
                        console.log(bot.rateLimits[message.author.id]);
                        bot.logger.warn(`${message.author.username} (${message.author.id}) in ${message.guild.name} (${message.guild.id}) was ratelimited`);
                    }
                    span.setTag('command.outcome', 'User Ratelimited');
                    span.finish();
                    return;
                }
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
                try {
                    if(message.getSetting("notice")){
                        message.channel.send(message.getSetting("notice"));
                        bot.database.deleteSetting(message.guild.id, "notice");
                        if(bot.config.cache[message.guild.id])
                            bot.config.cache[message.guild.id].notice = null;
                    }

                    if(message.channel.permissionsFor){
                        const permissions = await message.channel.permissionsFor(bot.client.user);

                        if(!permissions || !permissions.has("SEND_MESSAGES")){
                            bot.logger.log("No permission to send messages in this channel.");
                            const dm = await message.author.createDM();
                            dm.send(":warning: I don't have permission to send messages in that channel.");
                            //TODO: COMMAND_NO_PERMS lang key
                            span.setTag('command.outcome', 'No Messages Permissions');
                            span.finish();
                            return;
                        }

                        if(bot.commandUsages[command].requiredPermissions && !permissions.has(bot.commandUsages[command].requiredPermissions)){
                            let permission = "";
                            for(let i = 0; i < bot.commandUsages[command].requiredPermissions.length; i++){
                                permission += bot.util.permissionsMap[bot.commandUsages[command].requiredPermissions[i]];
                                if(i < bot.commandUsages[command].requiredPermissions.length-1)
                                    permission+=", ";
                            }
                            span.setTag('command.outcome', 'Missing Permissions');
                            span.finish();
                            return message.replyLang("ERROR_NEEDS_PERMISSION", {permission});
                        }
                    }

                    bot.commands[command](message, args, bot);
                    span.setTag('command.outcome', 'Executed Successfully');
                } catch (e) {
                    message.channel.stopTyping(true);
                    message.reply(e.toString());
                    console.log(e);
                    bot.raven.captureException(e);
                    span.setTag('command.outcome', 'Uncaught Error');
                } finally {
                    bot.database.logCommand(message.author.id, message.channel.id, message.guild ? message.guild.id : message.channel.id, message.id, command ,message.content).catch(function (e) {
                        Sentry.captureException(e);
                        bot.logger.error(e);
                    }).then(function(){
                        span.finish();
                    })
                }
            });
        });


        bot.loadCommand = function(command, reload){
            const module = "../commands/" + command;
            if(reload)
                delete require.cache[require.resolve(module)];
            let loadedCommand = require(module);
            if (loadedCommand.init && !reload) {
                try {
                    loadedCommand.init(bot);
                }catch(e){
                    Sentry.captureException(e);
                    bot.logger.error(e);
                    if(bot.client && bot.client.shard){
                        bot.client.shard.send({type: "warning", payload: {
                                id: "badInit-"+command,
                                message: `Couldn't initialise command ${command}:\n${e.message}`
                            }});
                    }
                }
            }
            bot.logger.log(`Loaded command ${loadedCommand.name}`);

            for (let i in loadedCommand.commands) {
                if (loadedCommand.commands.hasOwnProperty(i)) {
                    const commandName = loadedCommand.commands[i];
                    if(bot.commands[commandName] && !reload){
                        if(bot.client.shard)
                            bot.client.shard.send({type: "warning", payload: {id: "commandOverwritten-"+commandName, message: `Command ${commandName} already exists as '${bot.commandUsages[commandName].id}' and is being overwritten by ${command}!`}})
                    }
                    bot.commands[commandName] = loadedCommand.run;
                    bot.commandUsages[commandName] = {
                        id: command,
                        name: loadedCommand.name,
                        usage: loadedCommand.usage,
                        requiredPermissions: loadedCommand.requiredPermissions,
                        detailedHelp: loadedCommand.detailedHelp,
                        hidden: loadedCommand.hidden,
                        categories: loadedCommand.categories,
                        rateLimit: loadedCommand.rateLimit,
                        premium: loadedCommand.premium,
                        vote: loadedCommand.vote,
                        unwholesome: loadedCommand.unwholesome,
                        commands: loadedCommand.commands
                    };
                }
            }
        };

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
        fs.readdir(`${__dirname}/../commands`, function readCommands(err, files) {
            if (err) {
                bot.logger.error("Error reading from commands directory");
                console.error(err);
                Sentry.captureException(err);
            } else {
                async.eachSeries(files, function loadCommands(command, callback) {
                    if (!fs.lstatSync(`${__dirname}/../commands/${command}`).isDirectory()) {
                        bot.loadCommand(command);
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