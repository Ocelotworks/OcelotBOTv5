const Discord = require('discord.js');
const Sentry = require('@sentry/node');
const Util = require("../util/Util");
const caller_id = require('caller-id');
const presenceMessages = [
    {message: "!help", type: 'LISTENING'},
    {message: "!profile", type: 'LISTENING'},
    {message: "!guess", type: 'LISTENING'},
    {message: "!premium", type: 'LISTENING'},
    {message: "!vote", type: 'LISTENING'},
    {message: "!suggest", type: 'LISTENING'},
    {message: "Minecraft Parody Songs", type: 'LISTENING'},
    {message: "ASMR", type: 'LISTENING'},
    {message: "lord jesus help us all", type: 'LISTENING'},
    {message: "is this thing on", type: 'LISTENING'},
    {message: "cha cha real smooth", type: 'LISTENING'},
    {message: "stonks", type: 'WATCHING'},
    {message: "farts", type: 'LISTENING'},
    {message: "that faint ringing", type: 'LISTENING'},
    {message: "the world burn", type: 'WATCHING'},
    {message: "you in the shower", type: 'WATCHING'},
    {message: "your complaints", type: 'LISTENING'},
    {message: "your !feedback", type: 'LISTENING'},
    {message: "staying indoors", type: 'LISTENING'},
    {message: "Toilet Jake isn't real, he can't hurt you", type: "WATCHING"},
    {message: "amogus", type: "WATCHING"},
    {message: "the imposter", type: "WATCHING"},
    {message: "the Olympics", type: "COMPETING"},
    {message: "meme posting", type: "COMPETING"},
    {message: "speed eating", type: "COMPETING"},
    {message: "creating bugs", type: "COMPETING"},
    {message: "pee", type: "STREAMING"},
    {message: "bad music", type: "STREAMING"},
    {message: "good music", type: "STREAMING"},
    {message: "hot garbage", type: "STREAMING"},
];


let lastWebhook = 0;

module.exports = {
    name: "Discord.js Integration",
    init: function (bot) {

        Discord.Message.prototype.getLang = function (message, values) {
            return bot.lang.getForMessage(this, message, values);
        }

        Discord.Message.prototype.replyLang = async function (message, values) {
            return this.channel.send(this.getLang(message, values));
        };

        Discord.CommandInteraction.prototype.getLang = function(message, values){
            return bot.lang.getTranslation(this.guild?.id || "global", message, values, this.user.id);
        }


        Discord.CommandInteraction.prototype.replyLang = function(message, values){
            if(typeof message === "string") {
                return this.reply({ephemeral: values?.ephemeral, content: this.getLang(message, values)});
            }
            if(message.content)
                message.content = this.getLang(message.content, values);
            return this.reply(message);
        }

        Discord.CommandInteraction.prototype.followUpLang = function(message, values){
            if(typeof message === "string")
                return this.followUp({ephemeral: values?.ephemeral, content: this.getLang(message, values)});
            if(message.content)
                message.content = this.getLang(message.content, values);
            return this.followUp(message);
        }

        Discord.TextChannel.prototype.sendLang = async function (message, values) {
            if(this.getLang)
                return this.send(this.getLang(message, values));
            return this.send(bot.lang.getForMessage(this, message, values));
        };

        Discord.Message.prototype.editLang = async function (message, values) {
            return this.edit(this.getLang(message, values));
        };

        Discord.TextChannel.prototype.getSetting = function (setting, user) {
            return bot.config.get(this.guild ? this.guild.id : "global", setting, user);
        };

        Discord.TextChannel.prototype.getBool = function (setting, user) {
            return bot.config.getBool(this.guild ? this.guild.id : "global", setting, user,);
        };

        Discord.Guild.prototype.getSetting = function (setting, user) {
            return bot.config.get(this.id ? this.id : "global", setting, user);
        };

        Discord.Guild.prototype.getBool = function (setting, user) {
            return bot.config.getBool(this.id, setting, user,);
        };

        Discord.Message.prototype.getSetting = function (setting) {
            return bot.config.get(this.guild ? this.guild.id : "global", setting, this.author.id);
        };

        Discord.Message.prototype.getBool = function (setting) {
            return bot.config.getBool(this.guild ? this.guild.id : "global", setting, this.author.id);
        };

        const oldedit = Discord.Message.prototype.edit;
        Discord.Message.prototype.edit = async function edit(content, options) {
            Sentry.addBreadcrumb({
                message: "Editing Message",
                data: {content, options}
            });
            bot.bus.emit("messageSent", content);

            let editedMessage = await oldedit.apply(this, [content, options]);

            bot.logger.log({type: "messageEdited", message: bot.util.serialiseMessage(editedMessage)})

            return editedMessage;
        };

        const oldsend = Discord.TextChannel.prototype.send;
        Discord.TextChannel.prototype.send = async function send(content, options) {
            Sentry.addBreadcrumb({
                message: "Sending message",
                data: {content, options: JSON.stringify(options)}
            });

            try {
                Sentry.setExtra("caller", caller_id.getData())
            }catch(e){}
            bot.bus.emit("messageSent", content);

            let sentMessage = await oldsend.apply(this, [content, options]);

            bot.logger.log({type: "messageSend", message: bot.util.serialiseMessage(sentMessage)})

            return sentMessage;
        };


        const oldreply = Discord.CommandInteraction.prototype.reply
        Discord.CommandInteraction.prototype.reply = async function reply(options){
            console.log(this);
            bot.bus.emit("messageSent", options);
            bot.logger.log({type: "messageSend", message: bot.util.serialiseMessage({
                    ...options,
                    channel: bot.client.channels.cache.get(this.channelId),
                    guild: this.member?.guild,
                    member: this.member,
            })})
            return oldreply.apply(this, [options]);
        }

        //bot.presenceMessage = null;

        const clientOpts = {
            allowedMentions: {
                parse: ["users"],
                repliedUser: true,
            },
            messageCacheLifetime: 3600,
            messageSweepInterval: 3600,
            invalidRequestWarningInterval: 500,
            retryLimit: 3,
            presence: {
                activity: {
                    name: "Windows XP Startup Tune",
                    type: "LISTENING",
                }
            },
            partials: ["REACTION", "CHANNEL"],
            intents: [
                "GUILD_PRESENCES", // Spooking
                "GUILDS",
                "GUILD_MESSAGES",
                "GUILD_MEMBERS", // Join/leave messages
                "GUILD_VOICE_STATES", // Needed for voice commands
                "GUILD_MESSAGE_REACTIONS", // Non-button reaction events
                "DIRECT_MESSAGES",
                //"DIRECT_MESSAGE_REACTIONS" // Non-button reaction events e.g trivia, poll
            ]
        };

        if (process.env.GATEWAY) {
            console.log("Using gateway", process.env.GATEWAY);
            clientOpts.http = {
                api: process.env.GATEWAY
            }
        }

        bot.client = new Discord.Client(clientOpts);



        bot.client.bot = bot; //:hornywaste:
        bot.client.setMaxListeners(100);
        bot.lastPresenceUpdate = 0;
        bot.updatePresence = async function () {
            const now = new Date();
            if (now - bot.lastPresenceUpdate > 100000) {
                bot.lastPresenceUpdate = now;
                const serverCount = await Util.GetServerCount(bot);
                let randPresence = bot.util.arrayRand(presenceMessages);
                await bot.client.user.setPresence({
                    activities: [{
                        name: `${bot.presenceMessage ? bot.presenceMessage : randPresence.message} | ${serverCount.toLocaleString()} servers.`,
                        type: randPresence.type,
                    }]
                });
            } else {
                bot.logger.log("Not updating presence as last update was too recent.");
            }
        };

        bot.client.on("ready", async function discordReady() {
            let token = process.env.DISCORD_TOKEN;
            process.env.DISCORD_TOKEN = null;
            bot.client.token = new Proxy({}, {get: () => {
                const data = caller_id.getData();
                if(data.typeName === "RESTManager")
                    return ()=>token;
                bot.logger.warn(`Invalid token access from ${data.typeName}`);
                bot.logger.log(data);
                Sentry.setExtra("filePath", data.filePath);
                Sentry.setExtra("functionName", data.functionName);
                Sentry.setExtra("evalFlag", data.evalFlag);
                Sentry.captureException(`Invalid token access from ${data.typeName}`);
                return ()=>"undefined";
            }})

            Sentry.configureScope(function discordReady(scope) {
                bot.logger.log(`Logged in as ${bot.client.user.tag}`);
                scope.addBreadcrumb({
                    message: "ready",
                    level: Sentry.Severity.Info,
                    category: "discord",
                });
                setTimeout(bot.updatePresence, 150000);

                // bot.client.voiceConnections.cache.forEach(function leaveOrphanedVoiceChannels(connection){
                //     bot.logger.warn("Leaving orphaned voice "+connection.channel);
                //     connection.disconnect();
                // });

                try {
                    bot.rabbit.event({"type": "ready"});
                }catch(e){
                    console.error(e);
                    // If we have no rabbit, we are in trouble
                    process.exit(37);
                }
            });
        });

        // bot.client.on("reconnecting", function discordReconnecting(evt){
        //     bot.logger.log("Reconnecting...");
        //     Sentry.getCurrentHub().addBreadcrumb({
        //         category: "discord",
        //         message: "Reconnecting",
        //         level: Sentry.Severity.Warning,
        //         data: evt
        //     });
        // });

        bot.client.on("disconnect", function discordDisconnected(evt) {
            Sentry.getCurrentHub().addBreadcrumb({
                category: "discord",
                message: "Disconnected",
                level: Sentry.Severity.Warning,
                data: evt
            });
            bot.logger.warn("Disconnected");
        });


        bot.client.on("guildCreate", function joinGuild(guild) {
            Sentry.configureScope(async function joinGuild(scope) {
                bot.logger.log(`Joined server ${guild.id} (${guild.name})`);
                scope.addBreadcrumb({
                    category: "discord",
                    message: "guildCreate",
                    level: Sentry.Severity.Info,
                    data: {
                        id: guild.id,
                        name: guild.name
                    }
                });
                bot.updatePresence();
                try {
                    if (!guild.available) return;
                    try {
                        await bot.database.addServer(guild.id, guild.ownerId, guild.name, guild.joinedAt, guild.preferredLocale);
                    } catch (e) {
                        console.error(e);
                    }
                    await bot.database.unleaveServer(guild.id);
                    let mainChannel = bot.util.determineMainChannel(guild);
                    if (!bot.drain && bot.config.getBool("global", "welcome.enabled")) {
                        if (mainChannel) {
                            const prefix = guild.getSetting("prefix");
                            bot.logger.log(`Found main channel of ${mainChannel.name} (${mainChannel.id})`);
                            let embed = new Discord.MessageEmbed();
                            embed.setColor(bot.config.get("global", "welcome.embedColour"));
                            embed.setTitle("Welcome to OcelotBOT!");
                            embed.setDescription(`You can find my commands [here](https://ocelotbot.xyz/commands?prefix=${encodeURIComponent(prefix)}) or by typing ${prefix}help.`);
                            embed.addField("Prefix", `The prefix is set to ${prefix}, if you want to change it type **${prefix}settings set prefix ${prefix === "%" ? "!" : "%"}**`);
                            embed.addField("Wholesome?", `Don't want swearing in your Christian server? Disable NSFW/swearing commands by typing **${prefix}settings set wholesome true**`);
                            embed.addField("Administrators", `You can change the bot's settings by typing **${prefix}settings help**`);
                            embed.addField("Stuck?", "If you have issues or suggestions, type **!feedback** or join our [support server](https://discord.gg/7YNHpfF).");
                            embed.addField("Support", "You can support the bot by [voting](https://top.gg/bot/146293573422284800) or by subscribing to [premium](https://www.patreon.com/ocelotbot).");
                            mainChannel.send({embeds: [embed]});
                        }
                    }

                    if (bot.config.getBool("global", "webhook.enabled")) {
                        try {
                            let webhook = await mainChannel.createWebhook("OcelotBOT", bot.client.avatar);
                            bot.logger.log(`Created webhook for ${guild.id}: ${webhook.id}`);
                            await bot.database.addServerWebhook(guild.id, webhook.id, webhook.token);
                        } catch (e) {
                            bot.logger.warn("Failed to create webhook: " + e);
                        }
                    } else {
                        bot.logger.log("Not creating webhook.");
                    }

                } catch (e) {
                    bot.logger.warn(`Error adding server ${e}`);
                    Sentry.captureException(e);
                }
            });
        });

        bot.client.on("guildDelete", function leaveGuild(guild) {
            Sentry.configureScope(async function leaveGuild(scope) {
                bot.logger.log(`Left server ${guild.id} (${guild.name})`);
                if (!guild.available)
                    return bot.logger.warn("Guild is unavailable, probably discord issues.");
                scope.addBreadcrumb({
                    category: "discord",
                    message: "guildDelete",
                    level: Sentry.Severity.Info,
                    data: {
                        id: guild.id,
                        name: guild.name
                    }
                });
                await bot.database.leaveServer(guild.id);

                const now = new Date();
                if (bot.config.getBool("global", "webhook.enabled") && now - lastWebhook > 60000) {
                    bot.logger.log("Trying to send webhook...");
                    let webhookData = (await bot.database.getServerWebhook(guild.id))[0];
                    if (webhookData && webhookData.webhookID && webhookData.webhookToken) {
                        try {
                            let webhook = new Discord.WebhookClient({id: webhookData.webhookID, token: webhookData.webhookToken});
                            await webhook.send("Thanks for trying OcelotBOT! If you have any feedback, please drop it in the support server: https://discord.gg/7YNHpfF");
                            bot.logger.log("Successfully sent webhook");
                            await webhook.delete("OcelotBOT was kicked");
                            webhook.destroy();
                        } catch (e) {
                            bot.logger.warn("Failed to send webhook");
                            console.log(e);
                            //Sentry.captureException(e);
                        }
                    } else {
                        bot.logger.warn("Server had no webhook...");
                    }
                } else {
                    bot.logger.log("Not sending webhook");
                }
                lastWebhook = now;
            });
        });

        bot.client.on("error", function websocketError(evt) {
            bot.logger.log("Websocket Error");
            bot.logger.log(evt);
            Sentry.captureException(evt.error);
        });

        bot.client.on("guildUnavailable", function guildUnavailable(guild) {
            bot.logger.warn(`Guild ${guild.id} has become unavailable.`);
            lastWebhook = (new Date()).getTime() + 120000; //Quick hack to fix webhook spam during outages
            Sentry.getCurrentHub().addBreadcrumb({
                category: "discord",
                message: "guildUnavailable",
                level: Sentry.Severity.Warning,
                data: {
                    id: guild.id,
                    name: guild.name
                }
            });
        });


        bot.client.on("guildUpdate", async function guildUpdate(oldGuild, newGuild) {
            if (oldGuild.name !== newGuild.name && newGuild.getBool("doGuildNameUpdates")) {
                Sentry.getCurrentHub().addBreadcrumb({
                    category: "discord",
                    message: "guildUpdate",
                    level: Sentry.Severity.Info,
                    data: {
                        id: newGuild.id,
                        name: newGuild.name
                    }
                });
                bot.logger.info(`Guild ${oldGuild.name} (${oldGuild.id}) has changed it's name to ${newGuild.name}`);
                await bot.database.updateServer(oldGuild.id, {name: newGuild.name});
            }
        });

        // bot.client.on("rateLimit", function rateLimit(info){
        //     bot.logger.warn(`Rate Limit Hit ${info.method} ${info.path}`);
        //     bot.raven.captureBreadcrumb({
        //         message: "ratelimit",
        //         category:  "discord",
        //         data: info
        //     });
        //     bot.raven.captureException(new Error(`Rate Limit Hit ${info.method} ${info.path}`));
        // });

        bot.client.on("warn", function warn(warning) {
            bot.logger.warn(warning);
            Sentry.getCurrentHub().addBreadcrumb({
                category: "discord",
                message: "Warn",
                level: Sentry.Severity.Warning,
                data: {
                    warning: warning,
                }
            });
        });

        bot.client.on("guildMemberUpdate", function guildMemberUpdate(oldMember, newMember) {
            if (oldMember.id !== bot.client.user.id) return;
            if (!newMember.nickname) return;
            if (oldMember.nickname && oldMember.nickname === newMember.nickname) return;
            bot.logger.warn(`Nickname changed in ${oldMember.guild.name} (${oldMember.guild.id}) changed to ${newMember.nickname}`);
            Sentry.getCurrentHub().addBreadcrumb({
                category: "discord",
                message: "guildMemberUpdate",
                level: Sentry.Severity.Info,
                data: {
                    name: newMember.nickname
                }
            });
        });

        bot.client.once("ready", function orphanCheck() {
            if (!bot.client.shard) return;
            setInterval(() => {
                if (!process.connected) {
                    bot.logger.warn("Shard was orphaned, killing...");
                    process.exit(0);
                }
            }, 1000);
        });

        bot.client.on("threadCreate", (thread)=>{
            if(!thread.guild?.available)return;
            if(!bot.config.getBool(thread.guild.id, "thread.autojoin", thread.ownerId))return;
            if(!thread.joinable)return;
            bot.logger.log(`Joining thread ${thread.name} (${thread.id}) in ${thread.guildId}`)
            thread.join();
        })


        bot.bus.on("requestData", async (message) => {
            let data;
            if (message.payload.name === "channels") {
                let guild = message.payload.data.server;
                if (bot.client.guilds.cache.has(guild)) {
                    let guildObj = bot.client.guilds.cache.get(guild);
                    let channels = guildObj.channels.cache.map(function (channel) {
                        return {name: channel.name, id: channel.id, type: channel.type}
                    });
                    bot.logger.log("Sending channel data for " + guildObj.name + " (" + guild + ")");
                    data = channels;
                }
            } else if (message.payload.data.shard == bot.util.shard) {
                if (message.payload.name === "guildCount") {
                    data = {count: bot.client.guilds.cache.size};
                } else if (message.payload.name === "guilds") {
                    data = bot.client.guilds.cache.array();
                } else if (message.payload.name === "unavailableGuilds") {
                    data = bot.client.guilds.cache.filter((g) => !g.available).array();
                } else if (message.payload.name === "commandVersions") {
                    data = {};
                    for (let command in bot.commandUsages) {
                        if (bot.commandUsages.hasOwnProperty(command))
                            data[command] = bot.commandUsages[command].crc;
                    }
                }
            }
            if (data) {
                await bot.rabbit.event({
                    type: "dataCallback",
                    payload: {
                        callbackID: message.payload.callbackID,
                        data,
                    }
                });
            } else {
                bot.logger.warn("Unknown requestData type " + message.payload.name)
            }
        });

        bot.bus.on("presence", async (message) => {
            bot.logger.log("Updating presence: " + message.payload);
            bot.presenceMessage = message.payload === "clear" ? null : message.payload;
            await bot.updatePresence();
        })

        bot.bus.on("getUserInfo", async (message) => {
            let userID = message.payload;
            let user = await bot.client.users.fetch(userID);
            if (user) {
                await bot.rabbit.event({
                    type: "getUserInfoResponse", payload: {
                        id: user.id,
                        username: user.username,
                        discriminator: user.discriminator
                    }
                });
            }
        })


        bot.api.get('/discord', (req, res) => {
            const shard = bot.client.ws.shards.first();
            res.json({
                readyAt: bot.client.readyAt,
                uptime: bot.client.uptime,
                guilds: bot.client.guilds.cache.size,
                users: bot.client.users.cache.size,
                channels: bot.client.channels.cache.size,
                unavailable: bot.client.guilds.cache.filter((g) => !g.available).size,
                ws: {
                    shard: {
                        ping: shard.ping,
                        status: shard.status,
                    },
                    sessionStartLimit: bot.client.ws.sessionStartLimit,
                    reconnecting: bot.client.ws.reconnecting,
                    destroyed: bot.client.ws.destroyed,
                },
            })
        })

        bot.api.get('/user/:id', async (req, res) => {
            try {
                return res.json(await bot.client.users.fetch(req.params.id))
            } catch (err) {
                return res.json({err})
            }
        })

        bot.api.get('/guild/:id', async (req, res) => {
            try {
                const guild = await bot.client.guilds.fetch(req.params.id);
                res.json(bot.util.serialiseGuild(guild));
            } catch (err) {
                console.log(err);
                return res.json({err})
            }
        })

        bot.api.get('/guild/:id/channels', async (req, res) => {
            try {
                const guild = await bot.client.guilds.fetch(req.params.id);
                res.json((await guild.channels.fetch()).map((c)=>bot.util.serialiseChannel(c)));
            } catch (err) {
                console.log(err);
                return res.json({err})
            }
        })

        bot.api.get('/guild/:id/emoji', async (req, res) => {
            try {
                const guild = await bot.client.guilds.fetch(req.params.id);
                res.json(guild.emojis.cache.map((e)=>({id: e.id, url: e.url, name: e.name})));
            } catch (err) {
                console.log(err);
                return res.json({err})
            }
        })

        bot.api.get('/guild/:id/members', async (req, res) => {
            try {
                const guild = await bot.client.guilds.fetch(req.params.id);
                const members = await guild.members.fetch();
                res.json(members.map((m)=>bot.util.serialiseMember(m)));
            } catch (err) {
                console.log(err);
                return res.json({err})
            }
        })

        bot.api.get('/guild/:id/bots', async (req, res) => {
            try {
                const guild = await bot.client.guilds.fetch(req.params.id);
                const members = await guild.members.fetch();
                res.json(members.filter((m)=>m.user.bot).map((m)=>bot.util.serialiseMember(m)));
            } catch (err) {
                console.log(err);
                return res.json({err})
            }
        })

        bot.api.get('/guild/:id/roles', async (req, res) => {
            try {
                const guild = await bot.client.guilds.fetch(req.params.id);
                res.json((await guild.roles.fetch()).cache.map(bot.util.serialiseRole));
            } catch (err) {
                console.log(err);
                return res.json({err})
            }
        })

        bot.api.get('/guild/:id/member/:member', async (req, res) => {
            try {
                const guild = await bot.client.guilds.fetch(req.params.id);
                const member = await guild.members.fetch({user: req.params.member, cache: false});
                res.json(bot.util.serialiseMember(member));
            } catch (err) {
                console.log(err);
                return res.json({err})
            }
        })

        bot.logger.log("Logging in to Discord...");
        bot.client.login();
    }
};
