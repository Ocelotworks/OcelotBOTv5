/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 17/01/2019
 * ╚════ ║   (ocelotbotv5) count
 *  ════╝
 */

module.exports = {
    name: "Count",
    usage: "count",
    categories: ["tools"],
    commands: ["count"],
    hidden: true,
    run: async function run(message, args, bot) {
        if(!message.getSetting("ocelotworks"))return;
        if(!args[1]){
            message.channel.send("You must enter a search term");
            return;
        }
        const phrase = message.content.substring(args[0].length+1).trim();
        message.channel.startTyping();
        let result = await bot.database.getPhraseCount(phrase);
        message.channel.send(`'${phrase}' has been said **${result[0]['COUNT(*)']} times.**`);
        message.channel.stopTyping(true);
    }

};