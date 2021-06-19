/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 11/05/2019
 * ╚════ ║   (ocelotbotv5) unshorten
 *  ════╝
 */
const request = require('request');
const {axios} = require('../util/Http');
module.exports = {
    name: "Unshorten URL",
    usage: "unshorten :url",
    commands: ["unshorten"],
    categories: ["tools"],
    run: async function run(context, bot){
        const result = await axios.get(`https://unshorten.me/s/${encodeURIComponent(context.options.url)}`);
        if(!result.data || result.data === "Invalid Short URL")
            return context.send({content: `Invalid Short URL. You need to enter a URL e.g ${context.command} bit.ly/IqT6zt`, ephemeral: true});

        return context.send(`That URL unshortens as <${result.data}>`);
    }
};