const axios = require('axios');
const {MessageCommandContext, InteractionCommandContext, SyntheticCommandContext} = require("../util/CommandContext");
const {v4: uuid} = require('uuid');
module.exports = class Interactions{
    name = "Discord Interactions"
    bot;

    waiting = {};
    prefix = {};
    timeouts = {};

    constructor(bot){
        this.bot = bot;
        bot.interactions = this;
        this.clearAction = this.clearAction.bind(this);
    }

    init(){

        this.addHandler("!", this.handleSuggestedCommand.bind(this));

        // Legacy Interaction handling
        this.bot.client.on("raw", async (packet)=>{
            if(packet.t === "INTERACTION_CREATE"){
                const interaction = packet.d;
                if(interaction.type !== 3)return;
                let callback;
                if(interaction.data.custom_id && this.prefix[interaction.data.custom_id[0]]){
                    if(this.bot.drain)return;
                    callback = await this.prefix[interaction.data.custom_id[0]](interaction);
                }else if(this.waiting[interaction.data.custom_id]) {
                    callback = (await this.waiting[interaction.data.custom_id](interaction)) || {type: 6};
                }else{
                    if(this.bot.drain)return;
                    callback = {type: 4, data: {flags: 64, content: "Sorry, that button is no longer available."}};
                }
                const timeoutData = this.timeouts[interaction.data.custom_id];
                if(timeoutData){
                    clearTimeout(timeoutData.timer)
                    this.timeouts[interaction.data.custom_id] = {timer: setTimeout(this.clearAction, timeoutData.timeout, interaction.data.custom_id), timeout: timeoutData.timeout};
                }
                await axios.post(`https://discord.com/api/v8/interactions/${interaction.id}/${interaction.token}/callback`, callback);
                this.bot.raven.addBreadcrumb({
                    message: "Interaction",
                    data: interaction,
                })
                this.bot.logger.log({type: "interaction", interaction});
            }
        })
    }

    clearAction(id){
        this.bot.logger.log(`Interaction ${id} has timed out`);
        delete this.bot.interactions.waiting[id];
    }

    addAction(text, style, callback, timeout = 60000, emoji){
        const id = uuid();
        this.waiting[id] = callback;
        this.timeouts[id] = {timeout};
        if(timeout > 0)
            this.timeouts[id].timer = setTimeout(this.clearAction, timeout, id);
        return this.bot.util.buttonComponent(text, style, id, emoji);
    }

    addDropdown(placeholder, options, callback, min = 1, max = 3,timeout = 60000){
        const id = uuid();
        this.waiting[id] = callback;
        this.timeouts[id] = {timer: setTimeout(this.clearAction, timeout, id), timeout};
        return {type: 3, custom_id: id, options, placeholder, min_values: min, max_values: max}
    }

    addHandler(id, callback){
        this.bot.interactions.prefix[id] = callback;
    }

    suggestedCommand(context, command){
        return this.fullSuggestedCommand(context, `${context.command} ${command}`);
    }

    fullSuggestedCommand(context, command){
        //if(context.interaction)return null;
        return this.bot.util.buttonComponent(`${context.getSetting("prefix")}${command}`, 2, `!${context.user.id}!${command}`);
    }

    async handleSuggestedCommand(interaction){
        const [userId, command] = interaction.data.custom_id.substring(1).split("!",2);
        if(interaction.member.user.id !== userId)
            return {type: 4, data: {flags: 64, content: "Only the user that typed the command can use that button."}};
        const channel = await this.bot.client.channels.fetch(interaction.message.channel_id);
        const message = await channel.messages.fetch(interaction.message.id);
        const member = channel.guild ? channel.isThread() ? await channel.members.fetch(userId) : channel.members.get(userId) : {user: interaction.user}; // Hacky DM support
        if(!member)
            return {type: 4, data: {flags: 64, content: "You no longer have access to this channel. This message should never appear. Tell Big P#1843!"}};
        const synthContext = new SyntheticCommandContext(this.bot, member, member.user, channel, channel.guild, command);
        synthContext.message = message;
        const context = this.bot.command.initContext(synthContext);
        // it was all going so well up until this point
        for(let i = 0; i < message.components.length; i++){
            for(let j = 0; j < message.components[i].components.length; j++){
                if(message.components[i].components[j].customId === interaction.data.custom_id) {
                    message.components[i].components[j].disabled = true;
                    break;
                }
            }
        }
        await message.edit({components: message.components})
        this.bot.command.runCommand(context);
        return {type: 6};
    }

}