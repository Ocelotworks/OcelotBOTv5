const christmas = new Date("25 December 2021");
module.exports = {
    name: "Christmas Countdown",
    usage: "christmas",
    detailedHelp: "How long until Christmas?",
    usageExample: "christmas",
    responseExample: "🎅 **306 days, 11 hours, 19 minutes and 54 seconds** until christmas!",
    categories: ["tools"],
    commands: ["xmas", "christmas"],
    run: function run(message, args, bot) {
       const diff = (christmas-(new Date()))/1000;
       if(diff <= 0){
           message.replyLang("CHRISTMAS_TODAY");
       }else {
           message.replyLang("CHRISTMAS_COUNTDOWN", {time: bot.util.prettySeconds(diff, message.guild && message.guild.id, message.author.id)})
       }
    }
};