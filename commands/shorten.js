/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 11/05/2019
 * ╚════ ║   (ocelotbotv5) unshorten
 *  ════╝
 */
const config = require('config');
module.exports = {
    name: "Shorten URL",
    usage: "shorten <url>",
    commands: ["shorten"],
    categories: ["tools"],
    run: async function run(message, args, bot){
       let url = args[1];
       if(!url)
           return message.channel.send(`:bangbang: You must enter a URL to shorten e.g ${args[0]} <https://www.youtube.com/watch?v=dQw4w9WgXcQ>`);
       const result = await bot.util.getJson(`https://cutt.ly/api/api.php?key=${config.get("Commands.shorten.key")}&short=${encodeURIComponent(args[1])}`);
       if(!result.url)
           return message.replyLang("GENERIC_ERROR");

       if(result.url.shortLink) {
           return message.channel.send(`<${result.url.shortLink}>`);
       }
        switch(result.status){
            case 1:
                return message.channel.send("This URL is already shortened.");
            case 5:
            case 2:
                return message.channel.send("Please enter a valid URL.");
            case 6:
                return message.channel.send("That URL is from a blocked domain, please try a different URL.");
            default:
                bot.logger.warn("Unknown status: "+result.status);
                console.log(result);
                return message.replyLang("GENERIC_ERROR");
        }

    }
};