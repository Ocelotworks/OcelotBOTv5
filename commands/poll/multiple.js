module.exports = {
    name: "Allow Multiple Responses",
    usage: "multiple :0id",
    commands: ["multiple"],
    run: async function (context, bot) {
        const id = context.options.id;
        const poll = await bot.database.getPoll(context.options.id);
        if(!poll || poll.serverID !== context.guild.id)return context.sendLang({content: "POLL_NOT_FOUND", ephemeral: true});
        if(poll.creatorID != context.user.id)return context.sendLang({content: "POLL_NOT_OWNED", ephemeral: true});

        let message = await (await bot.client.channels.fetch(poll.channelID)).messages.fetch(poll.messageID);
        if(!message)return;
        const embed = message.embeds[0];

        if(embed) {
            embed.setFooter(context.getLang("POLL_MULTIPLE_RESPONSES") + (embed.footer?.text || ""));

            message.edit({embeds: [embed], components: message.components});
        }

        await bot.database.updatePoll(context.guild.id, id, {multiple: true});

        if(context.message.components){
            context.message.components[1].components[0].disabled = true;
        }
        return context.editLang({content: "POLL_ALLOW_MULTIPLE_SUCCESS", components: context.message.components});
    }
};
