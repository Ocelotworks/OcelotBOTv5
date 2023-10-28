const {SyntheticCommandContext, ButtonInteractionContext, ButtonCommandContext} = require("../util/CommandContext");
const {v4: uuid} = require('uuid');
const {Interaction, InteractionWebhook} = require('discord.js');

// Now this is podracing
const InteractionResponses = require('discord.js/src/structures/interfaces/InteractionResponses');

 const defaultConfig = {
    "edit": false,
    "oneShot": true,
    "allowAnyone": false
};

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

        this.bot.client.on("interactionCreate", this.onInteraction.bind(this));

        this.bot.client.on("raw", this.onFormInteraction.bind(this));
    }

    async onInteraction(interaction){
        if(!interaction.isButton() && !interaction.isSelectMenu() && interaction.type !== "MODAL")return;
        let context = new ButtonInteractionContext(this.bot, interaction);
        if(interaction.customId && this.prefix[interaction.customId[0]]){
            if(this.bot.drain)return;
            await this.prefix[interaction.customId[0]](interaction, context);
        }else if(this.waiting[interaction.customId]) {
            let result = await this.waiting[interaction.customId](interaction, context);
            if(!result && !interaction.replied)await interaction.deferUpdate();
        }else{
            if(this.bot.drain)return;
            context.sendLang({content: "GENERIC_BUTTON_UNAVAILABLE", ephemeral: true});
        }
        const timeoutData = this.timeouts[interaction.customId];
        if(timeoutData?.timer){
            clearTimeout(timeoutData.timer)
            this.timeouts[interaction.customId] = {timer: setTimeout(this.clearAction, timeoutData.timeout, interaction.customId), timeout: timeoutData.timeout};
        }
        this.bot.raven.addBreadcrumb({
            message: "Interaction",
            data: interaction,
        })
        this.bot.logger.log({type: "interaction", interaction: this.bot.util.serialiseInteraction(interaction)});
    }

    // Hacky code for converting form interactions into real interactions
    async onFormInteraction(packet) {
        if (this.bot.drain || (packet.t !== "INTERACTION_CREATE" || packet.d?.type !== 5)) return;
        let djsInteraction = new ModalInteraction(this.bot.client, packet.d);
        return this.onInteraction(djsInteraction);
    }

    clearAction(id){
        this.bot.logger.log(`Interaction ${id} has timed out`);
        delete this.bot.interactions.waiting[id];
    }


    awaitForm(context, formData, timeout = 60000){
        return new Promise(async (fulfill, reject)=>{
            const id = uuid();
            this.waiting[id] = (data)=>{
                let output = {};
                for(let i = 0; i < data.components.length; i++){
                    for(let x = 0; x < data.components[i].components.length; x++){
                        const component = data.components[i].components[x];
                        console.log(component);
                        output[component.custom_id] = component.value;
                    }
                }
                fulfill(output);
            };
            formData.custom_id = id;
            await context.openForm(formData);
            this.timeouts[id] = {timer: setTimeout(()=>{
                reject("Interaction timed out");
                this.clearAction(id);
            }, timeout), timeout};
        })
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
        if(timeout > 0)
            this.timeouts[id] = {timer: setTimeout(this.clearAction, timeout, id), timeout};
        return {type: 3, custom_id: id, options, placeholder, min_values: min, max_values: max}
    }



    addHandler(id, callback){
        this.bot.interactions.prefix[id] = callback;
    }

    suggestedCommand(context, command, config){
        return this.fullSuggestedCommand(context, `${context.command} ${command}`, config);
    }

    fullSuggestedCommand(context, command, config = defaultConfig){
        return this.bot.util.buttonComponent(`${context.getSetting("prefix")}${command}`, 2, `!${context.user.id}!${Interactions.#mapSuggestedCommandConfig(config)}!${command}`);
    }

    static #unmapSuggestedCommandConfig(config){
        let output = {...defaultConfig};
        const configOptions = Object.keys(defaultConfig);
        for(let i = 0; i < configOptions.length; i++){
            output[configOptions[i]] = !!(config & 1<<i);
        }
        return output;
    }

    static #mapSuggestedCommandConfig(config){
        let output = 0;
        const configOptions = Object.keys(defaultConfig);
        for(let i = 0; i < configOptions.length; i++){
            output += +config[configOptions[i]]<<i
        }
        return output;
    }

    async handleSuggestedCommand(interaction, context){
        let [userId, configFlags, command] = interaction.customId.substring(1).split("!",3);
        if(!command) { // Handle old buttons with no config
            command = configFlags;
            configFlags = 2;
        }
        const config = Interactions.#unmapSuggestedCommandConfig(configFlags);
        if(!config.allowAnyone && interaction.user.id !== userId)
            return context.replyLang({content: "SUGGESTED_COMMAND_USER", ephemeral: true});
        const {message} = interaction;
        const synthContext = new ButtonCommandContext(this.bot, interaction, command);
        synthContext.message = message;
        const initContext = this.bot.command.initContext(synthContext);
        // noinspection ES6MissingAwait
        if(config.oneShot) {
            // it was all going so well up until this point
            for (let i = 0; i < message.components.length; i++) {
                for (let j = 0; j < message.components[i].components.length; j++) {
                    if (message.components[i].components[j].customId === interaction.customId) {
                        message.components[i].components[j].disabled = true;
                        break;
                    }
                }
            }
            await interaction.update({components: message.components});
        }
        return this.bot.command.runCommand(initContext)
    }

}

class ModalInteraction extends Interaction {
    constructor(client, data){
        super(client, data);
        this.type = "MODAL";
        this.id = data.id;
        this.customId = data.data.custom_id;
        this.components = data.data.components;
        this.webhook = new InteractionWebhook(this.client, this.applicationId, this.token);
    }

    deferReply(){}
    reply(){}
    fetchReply(){}
    editReply(){}
    deleteReply(){}
    followUp(){}
    deferUpdate(){}
    update(){}
}

InteractionResponses.applyToClass(ModalInteraction);