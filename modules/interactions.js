const axios = require('axios');
const {v4: uuid} = require('uuid');
module.exports = {
    name: "Discord Interactions",
    init: async function (bot) {
        bot.interactions = {};

        bot.interactions.waiting = {};
        bot.interactions.prefix = {};

        let timeouts = {};

        bot.interactions.addAction = function addAction(text, style, callback, timeout=60000){
            const id = uuid();
            bot.interactions.waiting[id] = callback;
            timeouts[id] = {timer: setTimeout(clearAction, timeout, id), timeout};
            return bot.util.buttonComponent(text, style, id);
        }

        bot.interactions.addHandler = function addHandler(id, callback){
            bot.interactions.prefix[id] = callback;
        }

        function clearAction(id){
            bot.logger.log(`Interaction ${id} has timed out`);
            delete bot.interactions.waiting[id];
        }

        // Legacy Interaction handling
        bot.client.on("raw", async (packet)=>{
            if(packet.t === "INTERACTION_CREATE"){
                const interaction = packet.d;
                if(interaction.type !== 3)return;
                // Happy path
                let callback;
                if(interaction.data.custom_id && bot.interactions.prefix[interaction.data.custom_id[0]]){
                    callback = await bot.interactions.prefix[interaction.data.custom_id[0]](interaction);
                }else if(bot.interactions.waiting[interaction.data.custom_id]) {
                    callback = {type: 6}
                    bot.interactions.waiting[interaction.data.custom_id](interaction);
                }else{
                    callback = {type: 4, data: {flags: 64, content: "Sorry, that button is no longer available."}};
                }
                const timeoutData = timeouts[interaction.data.custom_id];
                if(timeoutData){
                    clearTimeout(timeoutData.timer)
                    timeouts[interaction.data.custom_id] = {timer: setTimeout(clearAction, timeoutData.timeout, interaction.data.custom_id), timeout: timeoutData.timeout};
                }
                await axios.post(`https://discord.com/api/v8/interactions/${interaction.id}/${interaction.token}/callback`, callback);
                bot.raven.addBreadcrumb({
                    message: "Interaction",
                    data: interaction,
                })
                bot.logger.log({type: "interaction", interaction});
            }
        })

    }
};