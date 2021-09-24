module.exports = {
    name: "Rollback",
    usage: "rollback",
    commands: ["rollback", "undo"],
    settingsOnly: true,
    guildOnly: true,
    run: async function (context, bot) {
        const currentSpook = await bot.database.getSpooked(context.guild.id);
        if (!currentSpook)
            return context.sendLang({content: "SPOOK_ROLLBACK_NO_SPOOKS", ephemeral: true});

        const previousSpook = await bot.database.getPreviousSpook(context.guild.id);

        let content = "SPOOK_ROLLBACK_SUCCESS";
        let fromMember = context.member;
        let toMember;
        if (!previousSpook) {
            content = "SPOOK_ROLLBACK_NO_PREVIOUS_SPOOK";
            toMember = context.member;
        }else {
            toMember = await context.getMember(previousSpook.spooked);
            if (!toMember) {
                content = "SPOOK_ROLLBACK_PREVIOUS_SPOOKED_LEFT";
                toMember = context.member;
            } else if(bot.config.getBool("global", "spook.optout", toMember.id)) {
                content = "SPOOK_ROLLBACK_PREVIOUS_SPOOKED_OPTOUT";
                toMember = context.member;
            }
        }

        await context.commandData.spook(bot, context, fromMember, toMember, "ROLLBACK");
        return context.sendLang({content}, {fromMember, toMember});
    }

};