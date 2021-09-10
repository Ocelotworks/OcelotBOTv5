
module.exports = {
    name: "Points",
    usage: "points",
    categories: ["meta"],
    detailedHelp: "View the amount of points you have",
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["points"],
    nestedDir: "points",
    init: function init(bot){
        bot.addCommandMiddleware(async (context)=>{
            if(!context.getBool("points.enabled"))return true;
            if(!context.commandData.pointsCost)return true;
            const canUse = await bot.database.takePoints(context.user.id, context.commandData.pointsCost, context.commandData.id);
            if (!canUse)
                context.replyLang({content: "POINTS_REQUIRED", ephemeral: true}, {points: context.commandData.pointsCost})
            return canUse;
        }, "Points Cost")
    },
};