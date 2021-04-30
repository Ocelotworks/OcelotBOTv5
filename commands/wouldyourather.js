const Discord = require('discord.js');
module.exports = {
    name: "Would You Rather?",
    usage: "wouldyourather",
    detailedHelp: "Gives you a 'would you rather' question.",
    categories: ["games", "fun"],
    commands: ["wouldyourather", "wyr"],
    run: async function run(message, args, bot) {
      let questionResult = await bot.util.getJson("http://either.io/questions/next/1");
      const question = questionResult.questions[0];
      let embed = new Discord.MessageEmbed();
      embed.setTitle("Would You Rather...");
      embed.setColor("#6dccf2");
      console.log(question);
      embed.addField(question.option_1, "OR");
      embed.addField(question.option_2, question.moreinfo ? `_${question.moreinfo}_` : "(No description)");
      message.channel.send(embed);
    }
};