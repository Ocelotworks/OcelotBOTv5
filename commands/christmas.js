const christmas = new Date("25 December 2019");
module.exports = {
    name: "Christmas Countdown",
    usage: "christmas",
    categories: ["tools", "fun"],
    commands: ["xmas", "christmas"],
    run: function run(message, args, bot) {
       const diff = (christmas-(new Date()))/1000;
       if(diff <= 0){
           message.channel.send(":santa: Merry Christmas!");
       }else {
           message.channel.send(`:santa: **${bot.util.prettySeconds(diff)}** until christmas!`);
       }
    }

};