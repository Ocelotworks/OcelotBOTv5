const christmas = new Date("25 December 2022");
module.exports = {
    name: "Christmas Countdown",
    usage: "christmas",
    detailedHelp: "How long until Christmas?",
    usageExample: "christmas",
    responseExample: "🎅 **306 days, 11 hours, 19 minutes and 54 seconds** until christmas!",
    categories: ["tools"],
    commands: ["xmas", "christmas"],
    slashOptions: [],
    run: function run(context, bot) {
       const diff = (christmas-(new Date()))/1000;
       if(diff <= 0){
          return context.replyLang("CHRISTMAS_TODAY");
       }
       return context.replyLang("CHRISTMAS_COUNTDOWN", {time: bot.util.prettySeconds(diff, context.guild && context.guild.id, context.user.id)})
    }
};