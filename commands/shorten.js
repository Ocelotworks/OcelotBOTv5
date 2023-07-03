/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 11/05/2019
 * ╚════ ║   (ocelotbotv5) unshorten
 *  ════╝
 */
const config = require('config');
const Sentry = require('@sentry/node');
module.exports = {
    name: "Shorten URL",
    usage: "shorten :url",
    commands: ["shorten"],
    categories: ["tools"],
    run: async function run(context, bot){
       const result = await bot.util.getJson(`https://cutt.ly/api/api.php?key=${config.get("API.cuttly.key")}&short=${encodeURIComponent(context.options.url)}`);
       if(!result.url) {
           Sentry.captureMessage("Failed to create cutt.ly shortlink");
           return context.sendLang({content: "GENERIC_ERROR", ephemeral: true});
       }

       if(result.url.shortLink)
           return context.send(`<${result.url.shortLink}>`);

       return context.sendLang({content: "SHORTEN_ERROR_"+result.status, ephemeral: true});
    }
};