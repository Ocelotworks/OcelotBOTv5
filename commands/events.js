module.exports = {
    name: "Events",
    usage: "events",
    usageExample: `events create the 26th September "DnD Session"`,
    detailedHelp: "Create an event, register your interest and get reminders when the event is about to start",
    categories: ["tools"],
    requiredPermissions: ["EMBED_LINKS"],
    commands: ["events", "event"],
    guildOnly: true,
    nestedDir: "events",
    init: function(bot){
        bot.interactions.addHandler("E", async (interaction)=>{
            let [eventID, status] = interaction.data.custom_id.substring(1).split(":", 2);

            let userResponse = await bot.database.getUserResponse(interaction.member.user.id, eventID);

            if(!userResponse){
                await bot.database.addUserResponse(interaction.member.user.id, eventID, status);
            }else{
                await bot.database.updateUserResponse(interaction.member.user.id, eventID, status);
            }

            let message = await bot.client.channels.fetch(interaction.channel_id).then((c)=>c.messages.fetch(interaction.message.id));

            let responses = await bot.database.getResponseCounts(eventID);
            let embed = message.embeds[0];
            embed.fields = [];
            for (let i = 0; i < responses.length; i++){
                const response = responses[i];
                embed.addField(bot.lang.getTranslation(interaction.guild_id, `EVENTS_${response.status}`, {}, interaction.member.user.id), "" + response.count, true);
            }

            await message.edit({embeds: [embed]});

            return {type: 4, data: {flags: 64, content: bot.lang.getTranslation(interaction.guild_id, `EVENTS_STATUS_${status}`, {}, interaction.member.user.id)}};
        });
    }
};