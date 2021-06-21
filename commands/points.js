
module.exports = {
    name: "Points",
    usage: "points",
    categories: ["meta"],
    detailedHelp: "View the amount of points you have",
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["points"],
    init: function init(bot){
        bot.util.standardNestedCommandInit("points");
        bot.addCommandMiddleware(async (context)=>{
            if(!context.getBool("points.enabled"))return true;
            if(!context.commandData.pointsCost)return true;
            const canUse = await this.bot.database.takePoints(context.author.id, context.commandData.pointsCost, context.commandData.id);
            if (!canUse)
                context.send({
                    content: `This command requires <:points:817100139603820614>**${context.commandData.pointsCost}** points to use. Learn more with ${context.getSetting("prefix")}points`,
                    ephemeral: true,
                });
            return canUse;
        })

    },
    run: async function(message, args, bot){
        await bot.util.standardNestedCommand(message, args, bot, "points")
    }
};