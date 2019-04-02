/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 28/03/2019
 * ╚════ ║   (ocelotbotv5) deepdream
 *  ════╝
 */
const deepai = require('deepai');
const config = require('config');
const Discord = require('discord.js');
deepai.setApiKey(config.get("Commands.recolor.key"));
module.exports = {
    name: "Deepdream Image",
    usage: "deepdream [url]",
    commands: ["deepdream"],
    rateLimit: 100,
    requiredPermissions: ["ATTACH_FILES"],
    categories: ["image"],
    run: async function run(message, args, bot) {
        const url =  await bot.util.getImage(message, args);
        if(!url || !url.startsWith("http"))
            return message.replyLang("GENERIC_NO_IMAGE", {usage: module.exports.usage});
        message.channel.startTyping();

        let result = await deepai.callStandardApi("deepdream", {image: url});

        message.channel.send("", new Discord.Attachment(result.output_url));

        message.channel.stopTyping(true);

    }
};