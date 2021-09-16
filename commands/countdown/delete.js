module.exports = {
    name: "Delete Countdown",
    usage: "delete :id",
    commands: ["delete", "del", "remove"],
    run: async function (context, bot) {
        const countdown = await bot.database.getCountdown(context.options.id.toLowerCase(), context.guild?.id || context.channel.id);
        if(!countdown)
            return context.sendLang({content: "COUNTDOWN_NOT_FOUND", ephemeral: true});

        if(countdown.userID !== context.user.id && !context.channel.permissionsFor(context.user.id).has("MANAGE_CHANNELS"))
            return context.sendLang({content: "COUNTDOWN_NO_PERMISSIONS", ephemeral: true});


        await bot.database.deleteCountdown(countdown.id, countdown.serverID, countdown.userID);

        return context.sendLang({content: "COUNTDOWN_REMOVED", ephemeral: true}, countdown);
    }
}