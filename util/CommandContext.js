class CommandContext {

    bot;
    member;
    user;
    channel;
    guild;

    command;
    commandData;
    options = {};

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
        return this.bot.lang.getTranslation(this.guild?.id || "global", key, values, this.user?.id);
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

    send(options){
        this.message.channel.stopTyping();
        return this.message.channel.send(options);
    }

    reply(options){
        this.message.channel.stopTyping();
        return this.message.reply(options);
    }

    editLang(options, values, message){
        return this.edit(this.getOptionsOrString(options, values), message);
    }

    edit(options, message){
        return message.edit(options);
    }

    defer(options){
        return this.message.channel.startTyping();
    }
}

class InteractionCommandContext extends CommandContext {
    interaction;

    constructor(bot, interaction){
        super(bot, interaction.member, interaction.user, interaction.channel, interaction.guild);
        this.interaction = interaction;
        this.command = interaction.commandName;
        interaction.options.each((val)=>this.options[val.name]=val.value);
    }

    logPerformed(){
        this.bot.logger.log({
            type: "commandPerformed",
            command: {
                name: this.command,
                id: this.command,
                content: "interaction",
            },
            message: "Interaction"
        })
    }

    send(options){
        console.log("Sending message");
        if(this.interaction.replied || this.interaction.deferred)
            return this.interaction.followUp(options);
        return this.interaction.reply(options);
    }

    reply(options){
        // These are the same thing on interactions
        return this.send(options);
    }

    defer(options){
        if(this.interaction.deferred)return; // Don't bother if we've already deferred
        return this.interaction.defer(options);
    }

    edit(options){
        return this.interaction.editReply(options);
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
    MessageCommandContext,
    InteractionCommandContext
}