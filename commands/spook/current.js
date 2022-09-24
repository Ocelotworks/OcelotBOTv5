const now = new Date();
const end = new Date("1 November "+now.getFullYear());
module.exports = {
    name: "Currently Spooked",
    usage: "current",
    commands: ["current"],
    run: async function (context, bot) {
        const currentSpook = await bot.database.getSpooked(context.guild.id);
        const now = new Date();
        let spookedTime = 0;
        if(currentSpook) {
            spookedTime = now - currentSpook.timestamp;
            if (spookedTime > 8.64e+7 && currentSpook.type !== "IDLE") {
                return context.commandData.handleIdleCheck(bot, context.guild.id, context.channel.id);
            }
        }
        return context.sendLang({content: currentSpook ? "SPOOK_CURRENT" : "SPOOK_NOBODY"}, {
            spooked: currentSpook?.spooked,
            time: end,
            server: context.guild.id,
            spookedTime: bot.util.prettySeconds(spookedTime / 1000, context.guild.id, context.user.id),
        });
    }
}
