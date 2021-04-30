const Sentry = require('@sentry/node');
module.exports = {
    name: "Automatic Responses",
    init: function (bot) {

        bot.lastMessages = {};
        bot.lastMessageCounts = {};
        

        bot.client.on("ready", async ()=>{
            let responses = await bot.database.getCustomFunctionsForShard("AUTORESPOND", bot.client.guilds.cache.keyArray());
            for(let i = 0; i < responses.length; i++){
                const response = responses[i];
                if(bot.customFunctions.AUTORESPOND[response.server])
                    bot.customFunctions.AUTORESPOND[response.server][response.trigger] = response.function;
                else
                    bot.customFunctions.AUTORESPOND[response.server] = {[response.trigger]: response.function};
            }
        })

        bot.client.on("message", async function onMessage(message) {
            if (bot.drain) return;
            Sentry.configureScope(async function onMessage(scope) {
                scope.setTags({
                    "channel": message.channel.id,
                    "guild": message.guild ? message.guild.id : "DM",
                    "shard": bot.util.shard
                });
                scope.setUser({
                    id: message.author.id,
                    username: message.author.username
                });
                if(message.guild && !message.author.bot && bot.customFunctions.AUTORESPOND[message.guild.id]){
                    const keys = Object.keys(bot.customFunctions.AUTORESPOND[message.guild.id]);
                    const match = message.content.toLowerCase()
                    for(let i = 0; i < keys.length; i++)
                        if(match.includes(keys[i])) {
                            const success = await bot.util.runCustomFunction(bot.customFunctions.AUTORESPOND[message.guild.id][keys[i]], message, false);
                            if (!success) break;
                        }
                }
                if (message.getSetting("autorespond.threshold") > 1) {
                    if (bot.lastMessages[message.channel.id]) {
                        if (bot.lastMessages[message.channel.id] === message.content.toLowerCase()) {
                            if (bot.lastMessageCounts[message.channel.id])
                                bot.lastMessageCounts[message.channel.id]++;
                            else
                                bot.lastMessageCounts[message.channel.id] = 1;
                            if (bot.lastMessageCounts[message.channel.id] >= message.getSetting("autorespond.threshold")) {
                                if (!message.author.bot && !message.content.match(/@everyone|pls|spam|@here|raid|<@.*>|[-!.\]=/\\>+].*|http.*/gi)) {
                                    bot.logger.log(`Triggered repeat autorespond at channel ${message.channel.id} from ${message.content} = ${bot.lastMessages[message.channel.id]} ${bot.lastMessageCounts[message.channel.id]} times`)
                                    let matchableContent = message.content.toLowerCase();
                                    if (matchableContent.indexOf("ocelotbot") > -1) {
                                        matchableContent = matchableContent.replace("ocelotbot", `<@${message.author.id}>`);
                                        message.channel.send(matchableContent);
                                    } else {
                                        message.channel.send(message.content);
                                    }
                                }
                                bot.lastMessageCounts[message.channel.id] = -1000;
                            }
                        } else {
                            bot.lastMessageCounts[message.channel.id] = 0;
                            bot.lastMessages[message.channel.id] = message.content.toLowerCase();
                        }
                    } else {
                        bot.lastMessages[message.channel.id] = message.content.toLowerCase();
                    }
                }

                if (message.mentions && message.mentions.users.has(bot.client.user.id) && !message.author.bot) {
                    bot.logger.log({
                        type: "mentioned",
                        message: bot.util.serialiseMessage(message),
                    })
                    if (message.content.toLowerCase().indexOf("prefix") > -1)
                        bot.util.replyTo(message, `My prefix is **${message.getSetting("prefix")}**\nTo change the prefix, do ${message.getSetting("prefix")}settings set prefix %\nWhere % is the prefix you want.`);
                    else if (message.content.toLowerCase().indexOf("help") > -1 || message.content.toLowerCase().indexOf("commands") > -1)
                        bot.util.replyTo(message, `You can see my commands with ${message.getSetting("prefix")}help`);
                    else if (message.content.toLowerCase().indexOf("shut up") > -1) {
                        bot.util.replyTo(message, `:pensive: If I'm interrupting, you can always change my prefix with **${message.getSetting("prefix")}settings set prefix** or disable conflicting commands with ${message.getSetting("prefix")}settings disableCommand`)
                    }

                    // bot.mixpanel.track("Bot mentioned", {
                    //     distinct_id: message.author.id,
                    //     channel_id: message.channel.id,
                    //     channel_name: message.channel.name,
                    //     server_id: message.guild ? message.guild.id : "0",
                    //     server_name: message.guild ? message.guild.name : "DM Channel",
                    //     message: message.cleanContent
                    // })
                }
                if (message.getSetting("yikesUser") && message.author.id === message.getSetting("yikesUser") && message.content.length > message.getSetting("yikesThreshold")) {
                    message.react(message.getSetting("yikesEmoji"));
                }
            });
        });


        // bot.client.on("voiceStateUpdate", function voiceStateUpdate(oldMember, newMember){
        //     if(!newmember.voice.channelID)return;
        //     if(oldmember.voice.channelID === newmember.voice.channelID)return;
        //     if(!newMember.guild.me)return;
        //     if(!newMember.guild.me.voiceChannelID)return;
        //     if(newMember.guild.me.voiceChannelID !== newmember.voice.channelID)return;
        //     if(!bot.util.bots.music[newMember.id])return;
        //     if(!bot.config.getBool(newMember.guild.id, "autorespond.musicbot"))return;
        //     newMember.guild.me.lastMessage.channel.send(`**Oh god, ${bot.util.bots.music[newMember.id]} too?**`);
        // });

        bot.client.on("channelCreate", function channelCreate(channel) {
            if (channel.deleted) return;
            if (channel.type !== "text") return;
            if (channel.name.toLowerCase().indexOf("ocelot") < 0) return;
            if (!channel.guild.getBool("autorespond.channel")) return;
            bot.logger.log(`Autoresponding to channel name ${channel.name}`);
            channel.send("Aww, a channel just for me? <3");

        });
    }
};