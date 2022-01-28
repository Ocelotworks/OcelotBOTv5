/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 27/01/2019
 * ╚════ ║   (ocelotbotv5) removebg
 *  ════╝
 */

const request = require('request');
const Discord = require('discord.js');
const Util = require("../util/Util");
const {axios} = require("../util/Http");


module.exports = {
    name: "Portrait Image",
    usage: "portrait :image?",
    usageExample: "portrait @Big P",
    detailedHelp: "Portrait filter for photos",
    rateLimit: 100,
    commands: ["portrait"],
    categories: ["image", "filter"],
    slashCategory: "filter",
    run: async function run(context, bot) {
        const url = await Util.GetImage(bot, context)
        if(!url)
            return context.replyLang({content: "GENERIC_NO_IMAGE", ephemeral: true}, {usage: module.exports.usage});

        await context.defer();
        const result = await axios.get(`https://ob-prod-rembg.d.int.unacc.eu/portrait?url=${encodeURIComponent(url)}`, {responseType: "arraybuffer"});

        let attachment = new Discord.MessageAttachment(result.data, "removebg.png");
        return context.send({files:[attachment]});
    }
};

