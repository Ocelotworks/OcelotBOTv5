/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 28/03/2019
 * ╚════ ║   (ocelotbotv5) enhance
 *  ════╝
 */
const deepai = require('deepai');
const config = require('config');
const Discord = require('discord.js');
deepai.setApiKey(config.get("Commands.recolor.key"));
module.exports = {
    name: "Enhance Image",
    usage: "enhance [url]",
    commands: ["enhance"],
    rateLimit: 100,
    requiredPermissions: ["ATTACH_FILES"],
    categories: ["image"],
    run: async function run(message, args, bot) {
        const url =  await bot.util.getImage(message, args);
        if(!url || !url.startsWith("http"))
            return message.replyLang("GENERIC_NO_IMAGE", {usage: module.exports.usage});
        message.channel.startTyping();

        let result = await deepai.callStandardApi("torch-srgan", {image: url});
        console.log(result);
        if(result.output_url) {
            message.channel.send("", new Discord.Attachment(result.output_url));
        }else{
            message.replyLang("ENHANCE_MAXIMUM_RESOLUTION");
        }

        message.channel.stopTyping(true);

    }
};