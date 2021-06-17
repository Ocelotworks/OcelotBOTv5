const {axios} = require('./Http');
const Image = require('./Image');
const FormData = require('form-data');
const Sentry = require('@sentry/node');
const Discord = require('discord.js');
const Strings = require("./String");
const config = require('config');
module.exports = class Util {
    /**
     * Returns slash command options given an ocelotbot pattern
     * @param pattern
     * @param argDescriptions
     * @constructor
     */
    static PatternToOptions(pattern, argDescriptions = {}){
        let output = [];
        for(let i = 0; i < pattern.length; i++){
            const argument = pattern[i];
            let option = {
                name: argument.name,
                description: argDescriptions[argument.name] || argument.name,
                required: !argument.optional,
            };
            switch(argument.type){
                case "option":
                    option.type = "STRING";
                    option.choices = argument.options.map((option)=>({name: argDescriptions[option] || option, value: option}))
                    break;
                case "user":
                    option.type = "USER";
                    break;
                case "role":
                    option.type = "ROLE";
                    break;
                case "boolean":
                    option.type = "BOOLEAN";
                    break;
                case "channel":
                    option.type = "CHANNEL";
                    break;
                case "integer":
                    option.type = "INTEGER";
                    break;
                default:
                    console.log("TODO: argument.type ", argument.type);
                case "single":
                    option.type = "STRING";
                    break;

            }
            output.push(option);
        }
        return output;
    }

    /**
     * Generate a Cooltext thing
     * @param options
     * @returns {(function(*): Promise<*>)}
     * @constructor
     */
    static CooltextGenerator(options){
        return async (context)=> {
            try {
                context.defer();
                options.text = context.options.text;
                const formData = new FormData();
                Object.keys(options).forEach((key) => formData.append(key, options[key]))
                let result = await axios.post("https://cooltext.com/PostChange", formData, {
                    headers: {
                        ...formData.getHeaders()
                    }
                });
                if (result.data.renderLocation) {
                    if(context.message){
                        return context.send({files: [new Discord.MessageAttachment(result.data.renderLocation)]})
                    }
                    return context.send(await Image.UploadToImgur(result.data.renderLocation));
                }
            }catch(e){
                Sentry.captureException(e);
            }
            return context.sendLang({content: "GENERIC_ERROR", ephemeral: true});
        }
    }


    static async #GetImageFromTenorURL(url) {
        try {
            const urlSplit = url.split("-");
            const id = urlSplit[urlSplit.length - 1];
            if (isNaN(id)) {
                return null;
            }
            let result = await axios.get(`https://api.tenor.com/v1/gifs?ids=${id}&key=${config.get("API.tenor.key")}`)
            return result.data.results?.[0]?.media?.[0]?.gif?.url;
        } catch (e) {
            Sentry.captureException(e);
            return null;
        }
    }

    static async #GetImageFromGfycatURL(url) {
        try {
            const urlSplit = url.split("/");
            const id = urlSplit[urlSplit.length - 1];
            let {data} = await axios.get(`https://api.gfycat.com/v1/gfycats/${id}`);
            if (!data.gfyItem?.content_urls)
                return null;
            if (data.gfyItem.content_urls.max1mbGif)
                return data.gfyItem.content_urls.max1mbGif.url;
            if (data.gfyItem.content_urls.max5mbGif)
                return data.gfyItem.content_urls.max5mbGif.url;
            if (data.gfyItem.content_urls.largeGif)
                return data.gfyItem.content_urls.largeGif.url;
        } catch (e) {
            Sentry.captureException(e);
        }
        return null;
    }

    static #GetImageFromMessage(targetMessage){
        if(targetMessage.content?.startsWith("http")){
            const arg = targetMessage.content.split(" ")[0];
            // Tenor GIFs
            if(arg.startsWith("https://tenor.com/"))
                return Util.#GetImageFromTenorURL(arg)

            // Gfycat GIFs
            if(arg.startsWith("https://gfycat.com/"))
                return Util.#GetImageFromGfycatURL(arg)
            return arg;
        }
        if(targetMessage.attachments?.size > 0){
            const targetAttachment = targetMessage.attachments.find((attachment) => (attachment.url || attachment.proxyURL));
            if (targetAttachment)
                return targetAttachment.url || targetAttachment.proxyURL;
        }

        if(targetMessage.embeds?.length > 0){
            const targetEmbed = targetMessage.embeds.find(function (embed) {
                return embed.image && (embed.image.url || embed.image.proxyURL)
            });
            return targetEmbed.image.url || targetEmbed.image.proxyURL;
        }

        return null;
    }

    static async GetImage(bot, context, argumentName = "image"){
        // If the argument exists, try and use that first
        if(context.options[argumentName]) {
            const arg = context.options[argumentName];

            // Tenor GIFs
            if(arg.startsWith("https://tenor.com/"))
                return Util.#GetImageFromTenorURL(arg)

            // Gfycat GIFs
            if(arg.startsWith("https://gfycat.com/"))
                return Util.#GetImageFromGfycatURL(arg)

            // Direct URLs
            if(arg.startsWith("http"))
                return arg;

            // User mentions
            const user = Strings.GetUserFromMention(bot,arg);
            if(user)
                return user.displayAvatarURL({dynamic: true, format: "png", size: 256});

            // Emojis
            const emoji = Strings.GetEmojiURLFromMention(arg);
            if(emoji)
                return emoji;


        }

    }
}