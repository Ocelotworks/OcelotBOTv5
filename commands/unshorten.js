/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 11/05/2019
 * ╚════ ║   (ocelotbotv5) unshorten
 *  ════╝
 */
const request = require('request');
module.exports = {
    name: "Unshorten URL",
    usage: "unshorten <url>",
    commands: ["unshorten"],
    categories: ["tools"],
    run: async function run(message, args, bot){
       let url = args[1];
       if(!url)
           return message.channel.send(`:bangbang: You must enter a URL to unshorten e.g ${args[0]} https://bit.ly/IqT6zt`);

        request(`https://unshorten.me/s/${encodeURIComponent(url)}`, function(err, resp, body){
            if(err)
                return message.replyLang("GENERIC_ERROR");

            if(!body || body === "Invalid Short URL")
                return message.channel.send(`Invalid Short URL. You need to enter a URL e.g ${args[0]} https://bit.ly/IqT6zt`);

            return message.channel.send(`That URL unshortens as ${body}`);
        })

    }
};