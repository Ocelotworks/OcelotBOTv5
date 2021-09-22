module.exports = {
    name: "Opt-Out",
    usage: "optout [confirm?:confirm]",
    commands: ["optout", "opt-out"],
    run: async function (context, bot) {
        if(context.getBool("spook.optout"))
            return context.sendLang({content: "SPOOK_ALREADY_OPTED_OUT", ephemeral: true});

        if(!context.options.confirm) {
            let button = bot.interactions.suggestedCommand(context, "optout confirm");
            button.label = context.getLang("SPOOK_OPT_OUT_CONFIRM_BUTTON");
            button.style = 4;
            return context.sendLang({
                content: "SPOOK_OPT_OUT_CONFIRM",
                ephemeral: true,
                components: [bot.util.actionRow(button)]
            });
        }

        await bot.database.setUserSetting(context.user.id, "spook.optout", "1");
        bot.rabbit.event({type: "reloadUserConfig"});

        const currentSpook = await bot.database.getSpooked(context.guild.id);
        if(currentSpook === context.user.id)
            context.commandData.forceNewSpook(currentSpook, "OPT_OUT", context.member);
        return context.sendLang({content: "SPOOK_OPT_OUT_SUCCESS"});
    }
};