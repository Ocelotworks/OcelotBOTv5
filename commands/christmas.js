const christmas = new Date("25 December 2018");
module.exports = {
    name: "Christmas Countdown",
    usage: "christmas",
    categories: ["tools", "fun"],
    commands: ["xmas", "christmas"],
    run: function run(message, args, bot) {
       const diff = (christmas-(new Date()))/1000;
       message.channel.send(`:santa: **${bot.util.prettySeconds(diff)}** until christmas!`);
    }

};