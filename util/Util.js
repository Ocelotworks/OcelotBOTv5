const {axios} = require('./Http');
const Image = require('./Image');
const FormData = require('form-data');
const Sentry = require('@sentry/node');
const Discord = require('discord.js');
const Strings = require("./String");
const config = require('config');
module.exports = class Util {

    static Sleep(milliseconds){
       return new Promise((fulfill)=>setTimeout(fulfill, milliseconds));
    }

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
        return output.sort((a,b)=>b.required-a.required);
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

    static async #GetImageFromPrevious(context, offset = 0){
        let messages = (await context.channel.messages.fetch({before: context.message?.id})).sort((a, b)=>b.createdTimestamp - a.createdTimestamp);
        messages = messages.first(messages.size); // Convert to array;
        console.log(messages.length, "messages");
        let currentOffset = 0;
        for(let i = 0; i < messages.length; i++){
            const image = Util.#GetImageFromMessage(messages[i]);
            if(image && (currentOffset++ >= offset))
                return image;
        }
        return null;
    }

    static async GetImage(bot, context, argumentName = "image", offset = 0){
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

        if(context.message?.reference?.messageID){
            const message = await (await bot.client.channels.fetch(context.message.reference.channelID)).messages.fetch(context.message.reference.messageID);
            const messageImage = Util.#GetImageFromMessage(message);
            if(messageImage)
                return messageImage;
        }

        return Util.#GetImageFromPrevious(context, offset)
    }

    static async StandardPagination(bot, context, pages, pageFormat, full = false){
        let index = parseInt(context.getSetting("pagination.page")) || 0;
        let sentMessage;
        let idleTimer;

        let clearButtons = async ()=>{
            if(pages.length )
            if(context.interaction || sentMessage){
                try{
                    context.edit({content: await pageFormat(pages[index], index), components: []}, sentMessage);
                }catch(e){
                    console.error(e);
                }
            }
        }

        let setIndex = function(delta){
            return async ()=> {
                index += delta;
                if(index < 0)index = pages.length - 1;
                if(index > pages.length-1)index = 0;
                await buildPage();
            }
        }

        let buttons = [
            bot.interactions.addAction("<", 1, setIndex(-1)),
            bot.interactions.addAction(">", 1, setIndex(+1)),
        ]

        if(full) {
            buttons = [
                bot.interactions.addAction("<<", 1, async ()=>{index=0; await buildPage()}),
                bot.interactions.addAction("<", 1, setIndex(-1)),
                bot.interactions.addAction(">", 1, setIndex(+1)),
                bot.interactions.addAction(">>", 1, async ()=>{index=pages.length-1; await buildPage()}),
            ]
        }

        let buildPage = async function () {
            let output = await pageFormat(pages[index], index);
            if(context.getBool("pagination.disable"))
                return context.send(output);

            let payload = {content: output};
            if(pages.length > 1){
                payload.components = [{type:1, components: buttons}]
            }else{
                if(idleTimer)
                    clearTimeout(idleTimer);
                idleTimer = setTimeout(clearButtons, 60000);
            }

            if ((context.interaction && context.interaction.replied) || (sentMessage && !sentMessage.deleted))
                return context.edit(payload, sentMessage)

            sentMessage = await context.send(payload)
        };

        await buildPage();
    }
}