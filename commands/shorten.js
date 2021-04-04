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
           return message.replyLang("SHORTEN_USAGE", {arg: args[0]});
       const result = await bot.util.getJson(`https://cutt.ly/api/api.php?key=${config.get("API.cuttly.key")}&short=${encodeURIComponent(args[1])}`);
       if(!result.url)
           return message.replyLang("GENERIC_ERROR");

       if(result.url.shortLink) {
           return message.channel.send(`<${result.url.shortLink}>`);
       }
       return message.replyLang("SHORTEN_ERROR_"+result.status);
    }
};