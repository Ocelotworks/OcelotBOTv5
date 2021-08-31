const Sentry = require('@sentry/node');
class CommandContext {

    bot;
    member;
    user;
    channel;
    guild;

    content;
    command;
    commandData;
    options = {};
    error;

    constructor(bot, member, user, channel, guild, command){
        this.bot = bot;
        this.member = member;
        this.user = user;
        this.channel = channel;
        this.guild = guild;
        this.command = command;
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
        return this.channel?.members.get(id);
    }

    getSetting(setting){
        return this.bot.config.get(this.guild?.id || "global", setting, this.user?.id);
    }

    getBool(setting){
        return this.bot.config.getBool(this.guild?.id || "global", setting, this.user?.id);
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

    editLang(options, values){
        return this.edit(this.getOptionsOrString(options, values));
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
}

class MessageCommandContext extends CommandContext {
    message;
    args;

    constructor(bot, message, args, command){
        super(bot, message.member, message.author, message.channel, message.guild);
        this.message = message;
        this.args = args;
        this.command = command;
        this.content = message.content;
    }

    logPerformed(){
        this.bot.logger.log({
            type: "commandPerformed",
            command: {
                name: this.command,
                id: this.command,
                content: this.message.content,
            },
            message: this.bot.util.serialiseMessage(this.message),
        })
    }

    async send(options){
        // How can this be possible?
        if(!this.message.channel)return this.bot.logger.warn("Channel was null? "+this.content);
        Sentry.addBreadcrumb({
            message: "Message Send",
            data: {
                command: this.command,
                id: this.message.id,
                guild: this.message.guild?.id,
                channel: this.message.channel?.id,
            }
        });
        Sentry.setExtra("context", {type: "message", command: this.command, args: this.args, message: this.message?.content});
        const message = await this.message.channel.send(options);
        this.message.response = message;
        this.bot.bus.emit("messageSent", message);
        return message;
    }

    async reply(options){
        Sentry.addBreadcrumb({
            message: "Message Replied",
            data: {
                command: this.command,
                id: this.message.id,
                guild: this.message.guild?.id,
                channel: this.message.channel?.id,
            }
        });
        Sentry.setExtra("context", {type: "message", command: this.command, args: this.args, message: this.message?.content});
        if(!this.message || this.message.deleted || this.channel.permissionsFor && !this.channel.permissionsFor(this.bot.client.user.id).has("READ_MESSAGE_HISTORY"))
            return this.send(options);

        const message = await this.message.reply(options);
        this.message.response = message;
        this.bot.bus.emit("messageSent", message);
        return message;
    }

    editLang(options, values, message){
        return this.edit(this.getOptionsOrString(options, values), message);
    }

    edit(options, message){
        Sentry.addBreadcrumb({
            message: "Message Edited",
            data: {
                command: this.command,
                id: this.message.id,
                guild: this.message.guild?.id,
                channel: this.message.channel?.id,
            }
        });
        Sentry.setExtra("context", {type: "message", command: this.command, args: this.args, message: this.message?.content});
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
        if(this.response && !this.response.deleted)
            return this.response.edit(options);
        return super.reply(options);
    }

    async reply(options){
        Sentry.setExtra("context", {type: "messageEdit", command: this.command, args: this.args, message: this.message?.content});
        if(this.response && !this.response.deleted)
            return this.response.edit(options);
        return super.reply(options);
    }
}

class InteractionCommandContext extends CommandContext {
    interaction;

    constructor(bot, interaction){
        super(bot, interaction.member, interaction.user, interaction.channel, interaction.guild);
        this.interaction = interaction;
        if(this.bot.slashCategories.includes(interaction.commandName) && interaction.options?.getSubcommand()) {
            this.command = interaction.options.getSubcommand();
            this.content = `/${interaction.commandName} ${interaction.options.getSubcommand()}`;
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

    logPerformed(){
        this.bot.logger.log({
            type: "commandPerformed",
            command: {
                name: this.command,
                id: this.command,
                content: this.content,
            },
            interaction: this.interaction,
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
        Sentry.setExtra("context", {type: "interaction", command: this.command, options: this.options});
        this.bot.bus.emit("messageSent", options);
        if(this.interaction.replied || this.interaction.deferred)
            return this.interaction.followUp(options);
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
        if(this.interaction.replied)
            return this.interaction.editReply(options);
        if(this.interaction.deferred)
            return this.interaction.followUp(options);
        return this.interaction.reply(options);
    }

    getLang(key, values) {
        // Override the prefix for slash commands
        if(key === "prefix"){
            return "/";
        }
        return super.getLang(key, values);
    }
}

class CustomCommandContext extends CommandContext {
 // TODO
}

module.exports = {
    CommandContext,
    CustomCommandContext,
    MessageEditCommandContext,
    MessageCommandContext,
    InteractionCommandContext
}