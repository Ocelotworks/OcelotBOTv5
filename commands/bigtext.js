const Discord = require('discord.js');
module.exports = {
    name: "Big Text Generator",
    usage: "bigtext <text>",
    categories: ["text"],
    requiredPermissions: ["EMBED_LINKS", "ATTACH_FILES"],
    commands: ["bigtext", "big"],
    run:  async function(message, args, bot) {
        if (!args[1]) {
            message.replyLang("GENERIC_TEXT", {command: args[0]});
            return;
        }
        const term = args.slice(1).join(" ");
        let loadingMessage = await message.channel.send("<a:ocelotload:537722658742337557> Processing...");
        let response = await bot.rabbit.rpc("imageFilter", {url: term, filter: "bigtext"});

        if(loadingMessage) {
            await loadingMessage.edit("<a:ocelotload:537722658742337557> Uploading...");
        }

        if (response.err) {
            console.log(response);
            await loadingMessage.delete();
            return message.channel.send(response.err);
        }

        let attachment = new Discord.MessageAttachment(Buffer.from(response.image, 'base64'), "bigtext.gif");
        try {
            const performanceMessage = `Frame Count: ${response.performance.frameCount} | Rendering Time: ${bot.util.prettySeconds(response.performance.frameTimeTotal/1000, message.guild ? message.guild.id : "global", message.author.id)} | ${Math.round(response.performance.frameTimeTotal/response.performance.frameCount)}ms/frame`;
            if(message.author.id === "139871249567318017") {
                await message.channel.send(performanceMessage,attachment);
            }else{
                bot.logger.log(performanceMessage);
                await message.channel.send(attachment);
            }
        }catch(e){
            bot.raven.captureException(e);
        }
        await loadingMessage.delete();
    }
};

