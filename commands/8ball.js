module.exports = {
  name: "Magic 8-ball",
  usage: "8ball <question>",
  categories: ["tools", "fun"],
  commands: ["8ball", "magic8ball"],
  run: function run(message, args, bot) {
    message.replyLang(args.length < 2 ? "8BALL_NO_QUESTION" : `8BALL_RESPONSE_${bot.rig8ball || bot.util.intBetween(0,14)}`);
  }
};