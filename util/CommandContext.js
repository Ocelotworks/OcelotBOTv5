const Sentry = require('@sentry/node');
const Strings = require("../util/String");
const {Routes} = require('discord-api-types/v9')
class CommandContext {

    bot;
    id;
    member;
    user;
    channel;
    guild;

    content;
    command;
    commandData;
    options = {};
    error;

    responsePrefix;

    constructor(bot, member, user, channel, guild, command, id){
        this.bot = bot;
        this.member = member;
        this.user = user;
        this.channel = channel;
        this.guild = guild;
        this.command = command;
        this.id = id;
    }


    logPerformed(){
        console.log(this);
    }

    async getMember(id){
        // Regular
        if(this.guild)
            return this.guild.members.fetch(id).catch(()=>null);
        // Threads (With no guild?)
        if(this.channel?.members?.fetch)
            return this.channel.members.fetch(id).catch(()=>null)
        return this.channel?.members?.get(id);
    }

    getSetting(setting){
        return this.bot.config.get(this.guild?.id || "global", setting, this.user?.id);
    }

    getBool(setting){
        return this.bot.config.getBool(this.guild?.id || "global", setting, this.user?.id);
    }

    getObject(setting){
        return this.bot.config.getObject(this.guild?.id || "global", setting, this.user?.id);
    }

    /**
     * Gets the options
     * @param {{content: string}} options The message options
     * @param {Object} values The key/values for the lang string
     * @returns {{content: string}} // The message options with the content formatted correctly
     */
    getOptionsOrString(options, values){
        if(typeof options === "string")
            return {content: this.getLang(options, values)};
        options.content = this.getLang(options.content, values);
        return options;
    }

    getLang(key, values){
        return this.bot.lang.getForContext(this, key, values);
    }

    sendLang(options, values){
        return this.send(this.getOptionsOrString(options, values));
    }

    editLang(options, values, message){
        return this.edit(this.getOptionsOrString(options, values), message);
    }

    replyLang(options, values){
        return this.reply(this.getOptionsOrString(options, values));
    }

    /**
     * Send sends a message, without replying
     * @param options
     */
    send(options){
        throw new Error("This context does not support sending");
    }

    /**
     * Edits a message
     * @param options
     */
    edit(options){
        throw new Error("This context does not support editing");
    }

    /**
     * Reply replies directly to the message
     * @param options
     */
    reply(options){
        throw new Error("This context does not support replying");
    }

    /**
     * Defer is for when a command is gonna take a while
     * @param options
     */
    defer(options){
        throw new Error("This context does not support deferring");
    }

    _appendPrefix(options, isEdit){
        if(!this.responsePrefix || (!options.content && isEdit))return;
        if(!options.content)
            options.content = this.responsePrefix;
        else
            options.content = `${this.responsePrefix}\n${options.content}`
    }

    setResponsePrefix(prefix){
        this.responsePrefix = prefix;
    }

    appendResponsePrefix(prefix){
        if(!this.responsePrefix)
            this.responsePrefix = prefix;
        else
            this.responsePrefix += "\n"+prefix;
    }
}

class MessageCommandContext extends CommandContext {
    message;
    args;

    constructor(bot, message, args, command){
        super(bot, message?.member, message?.author, message?.channel, message?.guild, command, message?.id);
        this.args = args;
        if(message) {
            this.message = message;
            this.content = message.content;
        }
    }

    logPerformed(){
        this.bot.logger.log({
            type: "commandPerformed",
            command: {
                name: this.command,
                id: this.command,
                content: this.message?.content,
            },
            message: this.bot.util.serialiseMessage(this.message),
        })
    }

    async send(options){
        // How can this be possible?
        if(!this.channel)return this.bot.logger.warn("Channel was null? "+this.content);
        if(!options) options = {content: "<Blank message>"};
        Sentry.addBreadcrumb({
            message: "Message Send",
            data: {
                command: this.command,
                id: this.message?.id,
                guild: this.message?.guild?.id,
                channel: this.message?.channel?.id,
            }
        });
        Sentry.setExtra("context", {type: "message", command: this.command, args: this.args, message: this.message?.content});
        if(options.components)options.components = options.components.filter((c)=>c);
        if(typeof options === "string")options = {content: options};
        this._appendPrefix(options);
        const message = await this.channel.send(options);
        if(this.message)
            this.message.response = message;
        this.bot.bus.emit("messageSent", message);
        return message;
    }

    async reply(options){
        Sentry.addBreadcrumb({
            message: "Message Replied",
            data: {
                command: this.command,
                id: this.id,
                guild: this.guild?.id,
                channel: this.channel?.id,
            }
        });
        Sentry.setExtra("context", {type: "message", command: this.command, args: this.args, message: this.message?.content});
        if(typeof options === "string")options = {content: options};
        this._appendPrefix(options);
        if(!this.message || this.message.deleted || this.channel.permissionsFor && !this.channel.permissionsFor(this.bot.client.user.id)?.has("READ_MESSAGE_HISTORY"))
            return this.send(options);
        const message = await this.message.reply(options).catch(()=>null);
        if(!message)return this.send(message);
        this.message.response = message;
        this.bot.bus.emit("messageSent", message);
        return message;
    }

    editLang(options, values, message){
        return this.edit(this.getOptionsOrString(options, values), message);
    }

    edit(options, message){
        // I still don't understand how this can happen
        if(!this.channel)return this.bot.logger.warn("Channel was null? "+this.content);
        Sentry.addBreadcrumb({
            message: "Message Edited",
            data: {
                command: this.command,
                id: this.id,
                guild: this.guild?.id,
                channel: this.channel?.id,
            }
        });
        Sentry.setExtra("context", {type: "message", command: this.command, args: this.args, message: this.message?.content});
        if(typeof options === "string")options = {content: options};
        this._appendPrefix(options, true);
        if(!message || message.deleted)return this.send(options);
        return message.edit(options);
    }

    defer(options){
        return this.message.channel.sendTyping();
    }
}

class MessageEditCommandContext extends MessageCommandContext {
    response;

    constructor(bot, message, response, args, command){
        super(bot, message, args, command);
        this.response = response;
    }

    async send(options){
        Sentry.setExtra("context", {type: "messageEdit", command: this.command, args: this.args, message: this.message?.content});
        if(options.components)options.components = options.components.filter((c)=>c);
        if(typeof options === "string")options = {content: options};
        this._appendPrefix(options, true);
        if(this.response && !this.response.deleted) {
            let editResult = await this.response.edit(options).catch(()=>null);
            if(editResult)return editResult;
        }
        return super.send(options);
    }

    async reply(options){
        Sentry.setExtra("context", {type: "messageEdit", command: this.command, args: this.args, message: this.message?.content});
        if(typeof options === "string")options = {content: options};
        this._appendPrefix(options, true);
        if(this.response && !this.response.deleted) {
            let editResult = await this.response.edit(options).catch(() => null);
            if (editResult) return editResult;
        }
        super._appendPrefix(options);
        return super.reply(options);
    }
}

class InteractionContext extends CommandContext {
    interaction;

    constructor(bot, interaction){
        super(bot, interaction.member, interaction.user, interaction.channel, interaction.guild,null, interaction.id);
        this.interaction = interaction;
    }

    logPerformed(){
        this.bot.logger.log({
            type: "commandPerformed",
            command: {
                name: this.command,
                id: this.command,
                content: this.content,
            },
            interaction: this.bot.util.serialiseInteraction(this.interaction),
        })
    }

    send(options){
        Sentry.addBreadcrumb({
            message: "Interaction Send",
            data: {
                command: this.command,
                id: this.interaction.id,
                guild: this.interaction.guildId,
                channel: this.interaction.channelId,
            }
        });
        if(typeof options === "string")
            options = {content: options};
        Sentry.setExtra("context", {type: "interaction", command: this.command, options: this.options});
        if(typeof options === "string")options = {content: options};
        this.bot.bus.emit("messageSent", options);
        if(options?.components)options.components = options.components.filter((c)=>c);
        options.fetchReply = true;
        if(this.interaction.replied || this.interaction.deferred)
            return this.interaction.followUp(options);
        super._appendPrefix(options);
        return this.interaction.reply(options);
    }

    reply(options){
        Sentry.addBreadcrumb({
            message: "Interaction Replied",
            data: {
                command: this.command,
                id: this.interaction.id,
                guild: this.interaction.guildId,
                channel: this.interaction.channelId,
            }
        });
        // These are the same thing on interactions
        return this.send(options);
    }

    defer(options){
        Sentry.addBreadcrumb({
            message: "Interaction Deferred",
            data: {
                command: this.command,
                id: this.interaction.id,
                guild: this.interaction.guildId,
                channel: this.interaction.channelId,
                replied: this.interaction.replied,
                deferred: this.interaction.deferred,
                content: options,
            }
        });
        Sentry.setExtra("context", {type: "interaction", command: this.command, options: this.options});
        if(this.interaction.deferred)return; // Don't bother if we've already deferred
        return this.interaction.deferReply(options);
    }

    edit(options){
        Sentry.addBreadcrumb({
            message: "Interaction Edited",
            data: {
                command: this.command,
                id: this.interaction.id,
                guild: this.interaction.guildId,
                channel: this.interaction.channelId,
                replied: this.interaction.replied,
                deferred: this.interaction.deferred,
                content: options,
            }
        });
        Sentry.setExtra("context", {type: "interaction", command: this.command, options: this.options});
        if(typeof options === "string")options = {content: options};
        this._appendPrefix(options, true);
        if(!this.interaction.replied)
            return this.interaction.reply(options);
        try {
            return this.interaction.editReply(options);
        }catch(e){
            console.log("Discord moment");
        }
        if(this.interaction.deferred)
            return this.interaction.followUp(options);
        return this.interaction.reply(options);
    }

    getSetting(setting) {
        if(setting === "prefix")
            return "/";
        return super.getSetting(setting);
    }


    openForm(data){
        this.interaction.replied = true;
        return this.bot.rest.post(Routes.interactionCallback(this.interaction.id, this.interaction.token), {
            body: {
                type: 9,
                data,
            },
        }).then(console.log).catch(console.error)
    }
}

class SyntheticCommandContext extends MessageCommandContext {
    synthetic = true;

    constructor(bot, member, user, channel, guild, input){
        super(bot);
        this.id = "SYNTHETIC"; // todo: make this a better ID
        this.member = member;
        this.user = user;
        this.channel = channel;
        this.guild = guild;
        this.content = input;
        this.args = input.split(" ");
        this.command = this.args[0];
    }
}

const blacklistedSettings = ["premium", "serverPremium", "admin", "ocelotworks", "feedback.responder"];

class CustomCommandContext extends SyntheticCommandContext {
    overrideSettings;

    constructor(bot, message, response){
        super(bot, message.member, message.author, message.channel, message.guild, response.content);
        this.message = message;
        this.overrideSettings = response.settings;
    }

    getSetting(setting) {
        if(!blacklistedSettings.includes(setting) && this.overrideSettings && this.overrideSettings[setting])
            return this.overrideSettings[setting];
        return super.getSetting(setting);
    }

    getLang(key, values = {}) {
        if(this.overrideSettings && this.overrideSettings["lang."+key]) {
            values.prefix = this.getSetting("prefix")
            values.botName = this.bot.client.user.username;
            values.command = this.command;
            values.commandWithPrefix = `${this.getSetting("prefix")}${this.command}`;
            values.fullCommandWithPrefix = values.commandWithPrefix;
            if(this.options?.command)
                values.fullCommandWithPrefix += ` ${this.options.command}`
            values.options = this.options;
            values.locale = this.getSetting("lang");
            if(values.locale === "en-owo")format.locale = "en-gb";
            return Strings.Format(this.overrideSettings["lang."+key], values);
        }
        return super.getLang(key, values);
    }
}

// Context for interactionless things, e.g reminders firing
class NotificationContext extends CommandContext {
    constructor(bot, channel, user, member){
        super(bot, member, user, channel, channel.guild);
    }

    async send(options){
        if(typeof options === "string")options = {content: options};
        this._appendPrefix(options, true);
        const message = await this.channel.send(options);
        if(this.message)
            this.message.response = message;
        this.bot.bus.emit("messageSent", message);
    }

    edit(options, message){
        this._appendPrefix(options, true);
        if(!message || message.deleted)return this.send(options);
        return message.edit(options);
    }

    reply(options){
        if(typeof options === "string")options = {content: options};
        this._appendPrefix(options, true);
        // Can't reply as there is nothing to reply to
        return this.send(options);
    }

    defer(options){
        // Ignore a defer, since the user doesn't know what's happening yet.
    }
}

class InteractionCommandContext extends InteractionContext {
    constructor(bot, interaction){
        super(bot, interaction);
        const subCommand = interaction.options?.getSubcommand(false);
        // TODO: this logic could be simpler
        if(subCommand){
            if(this.bot.slashCategories.includes(interaction.commandName)){
                this.command = subCommand;
                this.content = `/${interaction.commandName} ${subCommand}`;
            }else{
                this.command = interaction.commandName;
                this.content = `/${interaction.commandName}`
                this.options.command = subCommand;
            }
            interaction.options?.data[0]?.options?.forEach((val)=>{
                this.options[val.name]=val.value;
                this.content += ` ${val.name}:${val.value}`
            });
        }else {
            this.command = interaction.commandName;
            this.content = `/${interaction.commandName}`
            interaction.options.data?.forEach((val)=>{
                this.options[val.name]=val.value;
                this.content += ` ${val.name}:${val.value}`
            });
        }
    }
}

class ButtonInteractionContext extends InteractionContext {
    edit(options, message){
        if(typeof options === "string")options = {content: options};
        this._appendPrefix(options, true);
        if(message)
            return message.edit(options);
        return this.interaction.update(options);
    }

    defer(){
        if(!this.interaction.deferred && !this.interaction.replied)
            return this.interaction.deferUpdate();
    }
}

// Disgusting hybrid between a message command and an interaction
class ButtonCommandContext extends ButtonInteractionContext {
    synthetic = true

    constructor(bot, interaction, content) {
        super(bot, interaction);
        this.id = "SYNTHETIC"; // todo: make this a better ID
        this.content = content;
        this.args = content.split(" ");
        this.command = this.args[0];
    }

}

module.exports = {
    CommandContext,
    CustomCommandContext,
    SyntheticCommandContext,
    MessageEditCommandContext,
    MessageCommandContext,
    InteractionContext,
    InteractionCommandContext,
    NotificationContext,
    ButtonInteractionContext,
    ButtonCommandContext,
}