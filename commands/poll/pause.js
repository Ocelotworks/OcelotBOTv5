module.exports = {
    name: "Pause Poll",
    usage: "pause :0id",
    commands: ["pause", "resume"],
    run: async function (context, bot) {
        const id = context.options.id;
        const poll = await bot.database.getPoll(context.options.id);
        if(!poll || poll.serverID !== context.guild.id)return context.sendLang({content: "POLL_NOT_FOUND", ephemeral: true});
        if(poll.creatorID != context.user.id)return context.sendLang({content: "POLL_NOT_OWNED", ephemeral: true});

        let message = await (await bot.client.channels.fetch(poll.channelID)).messages.fetch(poll.messageID);
        if(!message)return;
        const embed = message.embeds[0];

        if(poll.paused){
            embed.setColor("#03F783");
            embed.setDescription(embed.description.substring(embed.description.indexOf("\n")));
        }else {
            embed.setColor("#d29700");
            embed.setDescription(`**Poll is currently not accepting entries.**\n${embed.description}`);
        }
        for (let i = 0; i < message.components.length; i++) {
            for (let j = 0; j < message.components[i].components.length; j++) {
                if (message.components[i].components[j].customId[0] !== "!") { // Not the "manage" button
                    message.components[i].components[j].disabled = !poll.paused;
                }
            }
        }
        message.edit({embeds: [embed], components: message.components});

        await bot.database.updatePoll(context.guild.id, id, {paused: !poll.paused});

        if(context.message.components){
            context.message.components[0].components[0].label =  poll.paused ?  "Pause Entries" : "Resume Entries";
        }
        return context.edit({content: poll.paused ? "Resumed Entries" : "Paused Entries", components: context.message.components});
    }
};
