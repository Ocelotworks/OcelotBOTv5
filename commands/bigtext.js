const Discord = require('discord.js');
const Strings = require("../util/String");
module.exports = {
    name: "Big Text Generator",
    usage: "bigtext :text+",
    categories: ["text"],
    detailedHelp: "Make text, but bigger.",
    usageExample: "bigtext this is really big",
    requiredPermissions: ["EMBED_LINKS", "ATTACH_FILES"],
    commands: ["bigtext", "big"],
    slashHidden: true,
    handleError: function(context){
        return context.sendLang({content: "GENERIC_TEXT", ephemeral: true});
    },
    run:  async function(context, bot) {
        // As slash commands can't upload files, this command can't be done yet as
        // it doesn't use the image processor so can't upload to imgur.
        if(!context.message)
            return context.send({content: "This command does not support slash commands", ephemeral: true})

        let mention = Strings.GetEmojiURLFromMention(context.options.text);
        if(mention)
            return context.send(mention);



        const term = context.options.text;
        let loadingMessage = await context.sendLang("GENERIC_PROCESSING");
        let response = await bot.rabbit.rpc("imageFilter", {url: term, filter: "bigtext"});

        if(loadingMessage)
            context.editLang("GENERIC_UPLOADING", {}, loadingMessage);

        if (response.err) {
            console.log(response);
            await loadingMessage.delete();
            return context.send(response.err);
        }


        let attachment = new Discord.MessageAttachment(Buffer.from(response.image, 'base64'), response.performance ?"bigtext.gif" : "bigtext.png");
        try {
            await context.send({files: [attachment]});
        }catch(e){
            bot.raven.captureException(e);
        }
        await loadingMessage.delete();
    }
};

