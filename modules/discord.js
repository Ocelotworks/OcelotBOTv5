const Discord = require('discord.js');
const { REST } = require('@discordjs/rest');
const Sentry = require('@sentry/node');
const Util = require("../util/Util");
const caller_id = require('caller-id');
const {NotificationContext} = require("../util/CommandContext");
const Embeds = require("../util/Embeds");
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

module.exports = class DiscordModule {
    bot;
    name = "Discord.js Integration";

    lastPresenceUpdate = 0;

    constructor(bot){
        this.bot = bot;
    }

    init(){
        this.overrideSendMethods();
        this.setupClient();
        this.setupRest();
        this.setupEvents();

        this.bot.logger.log("Logging in to Discord...");
        this.bot.client.login();
    }

    overrideSendMethods(){
        // Needed to preserve the `this` of these functions
        const bot = this.bot;
        Discord.Message.prototype.getLang = function (message, values) {
            return bot.lang.getForMessage(this, message, values);
        }

        Discord.Message.prototype.replyLang = async function (message, values) {
            if(!this.channel)return;
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
    }

    setupClient(){
        const clientOpts = {
            allowedMentions: {
                parse: ["users"],
                repliedUser: true,
            },
            failIfNotExists: false,
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
                //"GUILD_PRESENCES", // Spooking
                "GUILDS",
                "GUILD_MESSAGES",
                "GUILD_MEMBERS", // Join/leave messages
                "GUILD_VOICE_STATES", // Needed for voice commands
                "GUILD_MESSAGE_REACTIONS", // Non-button reaction events
                "DIRECT_MESSAGES",
                //"DIRECT_MESSAGE_REACTIONS" // Non-button reaction events e.g trivia, poll
            ],
            sweepers: {
                invites: {
                    interval: 30,
                    lifetime: 10,
                },
                bans: {
                    interval: 35,
                    filter: ()=>()=>true,
                },
                emojis: {
                    interval: 65,
                    filter: ()=>()=>true,
                },
                guildMembers: {
                    interval: 120,
                    filter: ()=>()=>true,
                },
                messages: {
                    interval: 40,
                    lifetime: 120,
                },
                threads: {
                    interval: 130,
                    lifetime: 10,
                },
                users: {
                    interval: 120,
                    filter: ()=>()=>true,
                },
                voiceStates: {
                    interval: 25,
                    filter: ()=>()=>true,
                }
            }
        };

        // Quick hack because discords verification process did a grumpy on me
        if(process.env.BOT_ID == "635846996418363402"){
            this.bot.logger.log("Using limited intents for OcelotBETA")
            clientOpts.intents = ["GUILDS", "GUILD_MESSAGES", "GUILD_VOICE_STATES", "DIRECT_MESSAGES"];
        }else{
            this.bot.logger.log(`Not using limited intents, this is '${process.env.BOT_ID}' not '635846996418363402'`);
        }

        if (process.env.GATEWAY) {
            console.log("Using gateway", process.env.GATEWAY);
            clientOpts.http = {
                api: process.env.GATEWAY,
                version: 9,
            }
        }

        this.bot.client = new Discord.Client(clientOpts);
        this.bot.client.bot = this.bot; //:hornywaste:
        this.bot.client.setMaxListeners(100);
    }

    setupRest(){
        this.bot.rest = new REST({version: '9'}).setToken(process.env.DISCORD_TOKEN);
    }

    async updatePresence(){
        const now = new Date();
        if (now - this.lastPresenceUpdate > 100000) {
            this.lastPresenceUpdate = now;
            const serverCount = await Util.GetServerCount(this.bot);
            let randPresence = this.bot.util.arrayRand(presenceMessages);
            await this.bot.client.user.setPresence({
                activities: [{
                    name: `${this.bot.presenceMessage || randPresence.message} | ${serverCount.toLocaleString()} servers.`,
                    type: randPresence.type,
                }]
            });
        } else {
            this.bot.logger.log("Not updating presence as last update was too recent.");
        }
    }

    setupEvents(){
        this.bot.client.on("ready", this.onDiscordReady.bind(this));
        this.bot.client.on("disconnect", this.onDiscordDisconnected.bind(this));
        this.bot.client.on("warning", this.onWarning.bind(this));
        this.bot.client.on("error", this.onWebsocketError.bind(this));
        this.bot.client.on("guildCreate", this.onGuildCreate.bind(this));
        this.bot.client.on("guildDelete", this.onGuildDelete.bind(this));
        this.bot.client.on("guildUnavailable", this.onGuildUnavailable.bind(this));
        this.bot.client.on("guildUpdate", this.onGuildUpdate.bind(this));
        this.bot.client.on("guildMemberUpdate", this.onGuildMemberUpdate.bind(this));
        this.bot.client.on("threadCreate", this.onThreadCreate.bind(this));
        
        this.bot.bus.on("requestData", this.busRequestData.bind(this));
        this.bot.bus.on("presence", this.busPresence.bind(this));
        this.bot.bus.on("getUserInfo", this.busGetUserInfo.bind(this));
        this.bot.bus.on("settingChanged", this.busSetupFinished.bind(this));

        this.bot.api.get('/discord', this.apiGetDiscordInfo.bind(this));
        this.bot.api.get('/user/:id', this.apiGetUserInfo.bind(this));
        this.bot.api.get('/guild/:id', this.apiGetGuildInfo.bind(this));
        this.bot.api.get('/guild/:id/channels', this.apiGetGuildChannels.bind(this));
        this.bot.api.get('/guild/:id/emoji', this.apiGetGuildEmoji.bind(this));
        this.bot.api.get('/guild/:id/members', this.apiGetGuildMembers.bind(this));
        this.bot.api.get('/guild/:id/member/:member', this.apiGetGuildMemberInfo.bind(this));
        this.bot.api.get('/guild/:id/bots', this.apiGetGuildBots.bind(this));
        this.bot.api.get('/guild/:id/roles', this.apiGetGuildRoles.bind(this));
    }

    /**
     * Discord Events
     */

    onDiscordReady(){
        Sentry.configureScope((scope)=>{
            scope.addBreadcrumb({
                message: "ready",
                level: Sentry.Severity.Info,
                category: "discord",
            });

            this.bot.logger.log(`Logged in as ${this.bot.client.user.tag}`);
            setTimeout(this.updatePresence.bind(this), 150000);

            try {
                this.bot.rabbit.event({"type": "ready"});
            }catch(e){
                console.error(e);
                // If we have no rabbit, we are in trouble
                process.exit(37);
            }
        });
    }

    onDiscordDisconnected(event){
        Sentry.getCurrentHub().addBreadcrumb({
            category: "discord",
            message: "Disconnected",
            level: Sentry.Severity.Warning,
            data: event
        });
        this.bot.logger.warn("Disconnected");
    }

    onWebsocketError(event){
        this.bot.logger.log("Websocket Error");
        this.bot.logger.log(event);
        Sentry.captureException(event.error);
    }

    onWarning(warning){
        this.bot.logger.warn(warning);
        Sentry.getCurrentHub().addBreadcrumb({
            category: "discord",
            message: "Warn",
            level: Sentry.Severity.Warning,
            data: {warning}
        });
    }

    onGuildCreate(guild){
        Sentry.configureScope(async(scope)=>{
            this.bot.logger.log(`Joined server ${guild.id} (${guild.name})`);
            scope.addBreadcrumb({
                category: "discord",
                message: "guildCreate",
                level: Sentry.Severity.Info,
                data: {
                    id: guild.id,
                    name: guild.name
                }
            });
            this.updatePresence();
            try {
                if (guild.available)
                    await this.bot.database.addServer(guild.id, guild.ownerId, guild.name, guild.joinedAt, guild.preferredLocale);
                await this.bot.database.unleaveServer(guild.id);
            } catch (e) {
                this.bot.logger.warn(`Error adding server ${e}`);
                Sentry.captureException(e);
            }
        });
    }

    onGuildDelete(guild){
        Sentry.configureScope(async(scope)=>{
            this.bot.logger.log(`Left server ${guild.id} (${guild.name})`);
            scope.addBreadcrumb({
                category: "discord",
                message: "guildDelete",
                level: Sentry.Severity.Info,
                data: {
                    id: guild.id,
                    name: guild.name
                }
            });
            await this.bot.database.leaveServer(guild.id);
        });
    }

    onGuildUnavailable(guild){
        this.bot.logger.warn(`Guild ${guild.id} has become unavailable.`);
        Sentry.getCurrentHub().addBreadcrumb({
            category: "discord",
            message: "guildUnavailable",
            level: Sentry.Severity.Warning,
            data: {
                id: guild.id,
                name: guild.name
            }
        });
    }

    onGuildUpdate(oldGuild, newGuild){
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
            this.bot.logger.info(`Guild ${oldGuild.name} (${oldGuild.id}) has changed it's name to ${newGuild.name}`);
            this.bot.database.updateServer(oldGuild.id, {name: newGuild.name});
        }
    }

    onGuildMemberUpdate(oldMember, newMember){
        if (oldMember.id !== this.bot.client.user.id) return;
        if (!newMember.nickname) return;
        if (oldMember.nickname && oldMember.nickname === newMember.nickname) return;
        this.bot.logger.warn(`Nickname changed in ${oldMember.guild.name} (${oldMember.guild.id}) changed to ${newMember.nickname}`);
        Sentry.getCurrentHub().addBreadcrumb({
            category: "discord",
            message: "guildMemberUpdate",
            level: Sentry.Severity.Info,
            data: {
                name: newMember.nickname
            }
        });
    }

    onThreadCreate(thread){
        if(!thread.guild?.available)return;
        if(!this.bot.config.getBool(thread.guild.id, "thread.autojoin", thread.ownerId))return;
        if(!thread.joinable)return;
        this.bot.logger.log(`Joining thread ${thread.name} (${thread.id}) in ${thread.guildId}`)
        thread.join();
    }

    /**
     * Bus Messages (RabbitMQ)
     */

    async busRequestData(message){
        let data;
        if (message.payload.name === "channels") {
            let guild = message.payload.data.server;
            if (this.bot.client.guilds.cache.has(guild)) {
                let guildObj = this.bot.client.guilds.cache.get(guild);
                let channels = guildObj.channels.cache.map(function (channel) {
                    return {name: channel.name, id: channel.id, type: channel.type}
                });
                this.bot.logger.log("Sending channel data for " + guildObj.name + " (" + guild + ")");
                data = channels;
            }
        } else if (message.payload.data.shard == this.bot.util.shard) {
            if (message.payload.name === "guildCount") {
                data = {count: this.bot.client.guilds.cache.size};
            } else if (message.payload.name === "guilds") {
                data = this.bot.client.guilds.cache.array();
            } else if (message.payload.name === "unavailableGuilds") {
                data = this.bot.client.guilds.cache.filter((g) => !g.available).array();
            } else if (message.payload.name === "commandVersions") {
                data = {};
                for (let command in this.bot.commandUsages) {
                    if (this.bot.commandUsages.hasOwnProperty(command))
                        data[command] = this.bot.commandUsages[command].crc;
                }
            }
        }
        if (data) {
            await this.bot.rabbit.event({
                type: "dataCallback",
                payload: {
                    callbackID: message.payload.callbackID,
                    data,
                }
            });
        } else {
            this.bot.logger.warn("Unknown requestData type " + message.payload.name)
        }
    }

    async busPresence(message){
        this.bot.logger.log("Updating presence: " + message.payload);
        this.bot.presenceMessage = message.payload === "clear" ? null : message.payload;
        await this.bot.updatePresence();
    }

    async busGetUserInfo(message){
        let userID = message.payload;
        let user = await this.bot.client.users.fetch(userID);
        if (user) {
            await this.bot.rabbit.event({
                type: "getUserInfoResponse", payload: {
                    id: user.id,
                    username: user.username,
                    discriminator: user.discriminator
                }
            });
        }
    }

    async busSetupFinished(guildId, setting){
        if(this.bot.drain || guildId === "global" || setting !== "oobe.finished")return;
        const guild = await this.bot.client.guilds.fetch(guildId);
        if(!guild || guild.unavailable)return;
        let mainChannel = await this.bot.util.determineMainChannel(guild);
        if(!mainChannel)return;
        const owner = await guild.members.fetch(guild.ownerId);
        if(!owner)return;
        let context = new NotificationContext(this.bot, mainChannel, owner.user, owner);
        if (!context.getBool("welcome.enabled"))return;
        this.bot.logger.log(`Sending welcome message to ${mainChannel}`)
        const prefix = context.getSetting("prefix");
        this.bot.logger.log(`Found main channel of ${mainChannel.name} (${mainChannel.id})`);
        let embed = new Embeds.LangEmbed(context);
        embed.setTitleLang("WELCOME_TITLE");
        embed.setDescriptionLang("WELCOME_DESC");
        embed.addFieldLang("WELCOME_PREFIX_TITLE", context.getBool("disableMessageCommands") ? "WELCOME_PREFIX_SLASH_DESC" : "WELCOME_PREFIX_DESC", false, {newPrefix: prefix === "%" ? "!" : "%"});
        embed.addFieldLang("WELCOME_WHOLESOME_TITLE", context.getBool("wholesome") ? "WELCOME_WHOLESOME_ENABLED_DESC" : "WELCOME_WHOLESOME_DESC");
        embed.addFieldLang("WELCOME_ADMINISTRATORS_TITLE", "WELCOME_ADMINISTRATORS_DESC");
        embed.addFieldLang("WELCOME_STUCK_TITLE", "WELCOME_STUCK_DESC");
        embed.addFieldLang("WELCOME_SUPPORT_TITLE", "WELCOME_SUPPORT_DESC");
        mainChannel.send({embeds: [embed]});
    }

    /**
     * API
     */

    apiGetDiscordInfo(req, res){
        const shard = this.bot.client.ws.shards.first();
        res.json({
            readyAt: this.bot.client.readyAt,
            uptime: this.bot.client.uptime,
            guilds: this.bot.client.guilds.cache.size,
            users: this.bot.client.users.cache.size,
            channels: this.bot.client.channels.cache.size,
            unavailable: this.bot.client.guilds.cache.filter((g) => !g.available).size,
            ws: {
                shard: {
                    ping: shard.ping,
                    status: shard.status,
                },
                sessionStartLimit: this.bot.client.ws.sessionStartLimit,
                reconnecting: this.bot.client.ws.reconnecting,
                destroyed: this.bot.client.ws.destroyed,
            },
        });
    }

    async apiGetUserInfo(req, res){
        try {
            return res.json(await this.bot.client.users.fetch(req.params.id))
        } catch (err) {
            return res.json({err})
        }
    }

    async apiGetGuildInfo(req, res){
        try {
            const guild = await this.bot.client.guilds.fetch(req.params.id);
            res.json(this.bot.util.serialiseGuild(guild));
        } catch (err) {
            return res.json({err})
        }
    }

    async apiGetGuildChannels(req, res){
        try {
            const guild = await this.bot.client.guilds.fetch(req.params.id);
            res.json((await guild.channels.fetch()).map(this.bot.util.serialiseChannel));
        } catch (err) {
            return res.json({err})
        }
    }

    async apiGetGuildEmoji(req, res){
        try {
            const guild = await this.bot.client.guilds.fetch(req.params.id);
            res.json(guild.emojis.cache.map((e)=>({id: e.id, url: e.url, name: e.name})));
        } catch (err) {
            return res.json({err})
        }
    }

    async apiGetGuildMembers(req, res){
        try {
            const guild = await this.bot.client.guilds.fetch(req.params.id);
            const members = await guild.members.fetch();
            res.json(members.map(this.bot.util.serialiseMember));
        } catch (err) {
            return res.json({err})
        }
    }

    async apiGetGuildBots(req, res){
        try {
            const guild = await this.bot.client.guilds.fetch(req.params.id);
            const members = await guild.members.fetch();
            res.json(members.filter((m)=>m.user.bot).map(this.bot.util.serialiseMember));
        } catch (err) {
            return res.json({err})
        }
    }

    async apiGetGuildRoles(req, res){
        try {
            const guild = await this.bot.client.guilds.fetch(req.params.id);
            res.json((await guild.roles.fetch()).map(this.bot.util.serialiseRole));
        } catch (err) {
            return res.json({err})
        }
    }

    async apiGetGuildMemberInfo(req, res){
        try {
            const guild = await this.bot.client.guilds.fetch(req.params.id);
            const member = await guild.members.fetch({user: req.params.member, cache: false});
            res.json(this.bot.util.serialiseMember(member));
        } catch (err) {
            console.log(err);
            return res.json({err})
        }
    }
}