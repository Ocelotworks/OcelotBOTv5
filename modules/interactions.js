const axios = require('axios');
const {v4: uuid} = require('uuid');
module.exports = {
    name: "Discord Interactions",
    init: async function (bot) {
        bot.interactions = {};

        bot.interactions.waiting = {};


        bot.interactions.addAction = function addAction(text, style, callback){
            const id = uuid();
            bot.interactions.waiting[id] = callback;
            return bot.util.buttonComponent(text, style, id);
        }

        bot.client.on("raw", async (packet)=>{
            if(packet.t === "INTERACTION_CREATE"){
                const interaction = packet.d;
                // Happy path
                let callback;
                if(bot.interactions.waiting[interaction.data.custom_id]) {
                    callback = {type: 6}
                    bot.interactions.waiting[interaction.data.custom_id](interaction);
                }else{
                    callback = {type: 4, data: {flags: 64, content: "Sorry, that button is no longer available."}};
                }
                await axios.post(`https://discord.com/api/v8/interactions/${interaction.id}/${interaction.token}/callback`, callback);
                bot.raven.captureBreadcrumb({
                    message: "Interaction",
                    data: interaction,
                })
                bot.logger.log(interaction);
            }
        })

    }
};