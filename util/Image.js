const {axios} = require('./Http');

const config = require('config');
const Sentry = require('@sentry/node');
const Discord = require('discord.js');
const {crc32} = require('crc');
const FormData = require('form-data');
const Util = require("./Util");
const Icon = require("./Icon");

module.exports = class Image {

    /**
     * Uploads a file to Imgur, returns undefined on failure
     * @param {String} url
     * @returns {Promise<String | null>}
     * @constructor
     */
    static async UploadToImgur(url){
        let image = await axios.get(url, {responseType: "stream"});
        const imgurData = new FormData();
        imgurData.append('image', image.data)
        try {
            let imgur = await axios({
                method: 'POST',
                url: 'https://api.imgur.com/3/image',
                headers: {
                    Authorization: `Client-ID ${config.get("API.imgur.key")}`,
                    ...imgurData.getHeaders()
                },
                data: imgurData,
                // Buzz lightyear shit
                maxBodyLength: Infinity,
                maxContentLength: Infinity,
            });
            return imgur.data?.data?.link
        }catch(e){
            Sentry.captureException(e);
        }
    }

    /**
     * Sends an Image Processor request
     * @param {Object} bot The OcelotBOT instance
     * @param {Object} request The Request object
     * @returns {*}
     * @constructor
     */
    static #imageProcessor(bot, request){
        const requestJson = JSON.stringify(request);
        bot.logger.log(requestJson);
        let key = crc32(requestJson).toString(32);
        return bot.redis.cache("imageProcessor/" + key, async () => await bot.rabbit.rpc("imageProcessor", request, 120000, {
            arguments: {"x-message-ttl": 60000},
            durable: false
        }), 600);
    }

    static async #imageFilter(bot, url, filter, input, format){
        return await bot.redis.cache(`imageProcessor/${filter}/${input}/${url}`, async () => await bot.rabbit.rpc("imageFilter", {
            url,
            filter,
            input,
            format
        }, 60000, {durable: true}));
    }

    static async ImageFilter(bot, usage, context, filter, input, format = "PNG"){
        const url = await Util.GetImage(bot, context);
        if(!url)
            return context.sendLang({content: "GENERIC_NO_IMAGE", ephemeral: true}, {usage});

        // // Slash commands can't upload files
        // if(!context.message)
        //     return context.send({content: "This command is not supported in this context."})

        return Image.#MessageImageFilter(bot, url, context, filter, input, format);
    }


    static async #MessageImageFilter(bot, url,  context, filter, input, format){
        const loadingMessage = await context.send(`${Icon.loading} Processing...`);
        const response = await Image.#imageFilter(bot, url, filter, input, format);
        if(response.err){
            bot.logger.log("Response error: "+response.err);
            await loadingMessage.delete();
            return context.sendLang("IMAGE_PROCESSOR_ERROR_" + response.err.toUpperCase());
        }else if(!response.image){
            return context.sendLang("GENERIC_ERROR")
        }

        const buf = Buffer.from(response.image, 'base64');

        bot.logger.log(`Buffer size: ${buf.byteLength}`)

        if(buf.byteLength >= 10000000){
            await loadingMessage.delete();
            return context.sendLang("IMAGE_PROCESSOR_ERROR_SIZE");
        }

        if(loadingMessage && !loadingMessage.deleted){
            await context.edit(`${Icon.loading} Uploading...`, loadingMessage);
        }
        const attachment = new Discord.MessageAttachment(buf, response.name);
        return context.send({files: [attachment]}).then(()=>loadingMessage.delete());
    }

    /**
     * Make an Image Processor request
     * @param bot
     * @param context
     * @param request
     * @param name
     * @param sentMessage
     * @constructor
     */
    static ImageProcessor(bot, context, request, name, sentMessage){
        if(context.interaction)
            return Image.InteractionImageProcessor(bot, context.interaction, request, sentMessage);
        return Image.MessageImageProcessor(bot, context.message, request, name, sentMessage)
    }

    /**
     * Makes an Image Processor request for Interaction requests
     * @param {Object} bot OcelotBOT instance
     * @param {Discord.CommandInteraction} interaction the Interaction
     * @param {Object} request The request object
     * @param sentMessage
     * @returns {Promise<Discord.Message | Discord.RawMessage>}
     * @constructor
     */
    static async InteractionImageProcessor(bot, interaction, request, sentMessage){
        request.metadata = {
            s: interaction.guild?.id,
            u: interaction.user.id,
            c: interaction.channel?.id,
            m: interaction.id,
        };
        request.version = 1;
        if(!interaction.deferred && !interaction.replied)
            await interaction.deferReply();
        try {
            let response = await Image.#imageProcessor(bot, request);
            if (response.err) {
                return interaction.followUp({content: bot.lang.getTranslation(interaction.guild?.id || "global", "IMAGE_PROCESSOR_ERROR_" + response.err.toUpperCase(), {}, interaction.user.id)});
            }
            if(response.size >= 10000000){
                return interaction.followUp({content: bot.lang.getTranslation(interaction.guild?.id || "global", "IMAGE_PROCESSOR_ERROR_SIZE", {}, interaction.user.id)});
            }
            let imgurData = await Image.UploadToImgur(response.path);
            if(!imgurData)return interaction.followUp({content: "Failed to upload to imgur. Try a different image"});
            if(sentMessage)
                return interaction.followUp({content: `${sentMessage}\n${imgurData}`})
            return interaction.followUp({content: imgurData});
        }catch(e){
            console.log(e);
            Sentry.captureException(e);
            return interaction.reply({content: "Failed to process image", ephemeral: true});
        }
    }

    /**
     * Makes an Image Processor request for Message requests (As opposed to Interactions)
     * @param {Object} bot OcelotBOT instance
     * @param {Discord.Message} message The message that initiated the request
     * @param {Object} request The request object
     * @param {String} name The name of the uploaded file
     * @param {String} sentMessage Added as content to the upload message
     * @constructor
     */
     static async MessageImageProcessor(bot, message, request, name, sentMessage){
        request.metadata = {
            s: message.guild ? message.guild.id : null,
            u: message.author.id,
            c: message.channel.id,
            m: message.id,
        };
        if (message.content.indexOf("-debug") > -1)
            request.debug = true;
        request.version = 1;

        bot.logger.log(JSON.stringify(request));
        let span = bot.util.startSpan("Receive from RPC");
        let loadingMessage;
        let loadingMessageDelay = setTimeout(async () => {
            loadingMessage = await message.replyLang("GENERIC_PROCESSING");
        }, 3000)
        message.channel.sendTyping();
        let response = await Image.#imageProcessor(bot, request);
        clearTimeout(loadingMessageDelay)
        span.end();
        if(!message.channel || message.channel.deleted){
            bot.logger.log("Server was left or channel was deleted before image processor completed");
            return null;
        }
        if(response.size && response.size >= 7000000 || message.channel.permissionsFor && !message.channel?.permissionsFor?.(bot.client.user.id)?.has("ATTACH_FILES")){
            if(response.size >= 10000000){
                await loadingMessage.editLang("IMAGE_PROCESSOR_ERROR_SIZE");
                return;
            }
            if (loadingMessage && !loadingMessage.deleted) {
                span = bot.util.startSpan("Edit loading message");
                await loadingMessage.editLang("GENERIC_UPLOADING_IMGUR");
                span.end();
            }
            let imgurResult = await Image.UploadToImgur(response.path);
            if(imgurResult)return message.channel.send(imgurResult);
            return message.channel.send("Failed to upload to imgur. Try a smaller image");
        }
        if (loadingMessage && !loadingMessage.deleted) {
            span = bot.util.startSpan("Edit loading message");
            await loadingMessage.editLang("GENERIC_UPLOADING");
            span.end();
        }
        if (response.err) {
            span = bot.util.startSpan("Delete processing message");
            if (loadingMessage && !loadingMessage.deleted)
                await loadingMessage.delete();
            span.end();
            return message.replyLang("IMAGE_PROCESSOR_ERROR_" + response.err.toUpperCase());
        }
        span = bot.util.startSpan("Upload image");
        if(!message.channel || message.channel.deleted){
            bot.logger.log("Server was left or channel was deleted before image upload completed");
            span.end();
            return null;
        }
        let messageResult;
        let attachment = new Discord.MessageAttachment(response.path, `${name}.${response.extension}`);
        try {
            messageResult = await message.channel.send({content: sentMessage, files: [attachment]});
        } catch (e) {
            if(!message.channel)return;
            Sentry.captureException(e);
            messageResult = await message.channel.send("Failed to send: "+e);
        }
        span.end();
        span = bot.util.startSpan("Delete processing message");
        if (loadingMessage && !loadingMessage.deleted)
            await loadingMessage.delete();
        span.end();
        return messageResult;
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
                process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
                context.defer();
                options.text = context.options.text;
                const formData = new FormData();
                Object.keys(options).forEach((key) =>formData.append(key, options[key]))
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
                console.log(e);
                Sentry.captureException(e);
            }
            return context.sendLang({content: "GENERIC_ERROR", ephemeral: true});
        }
    }

    static async NekobotImageGenerator(context, type, url){
        return this.NekobotGenerator(context, type, `url=${url}`);
    }

    static async NekobotTextGenerator(context, type, text){
        return this.NekobotGenerator(context, type, `text=${text}`);
    }

    static async NekobotGenerator(context, type, options){
        await context.defer();
        const result = await axios.get(`https://nekobot.xyz/api/imagegen?type=${type}&${options}`).catch((e)=>e.response);
        console.log(result?.data);
        if(!result?.data?.success) {
            if(result?.data?.message && result.data.message !== "Internal Server Error")
                Sentry.captureMessage("Nekobot Error: "+result.data.message)
            return context.sendLang({content: "IMAGE_PROCESSOR_ERROR_REPLY", ephemeral: true});
        }

        if(context.interaction)
            return context.send({content: result.data.message});

        const attachment = new Discord.MessageAttachment(result.data.message);
        return context.send({files: [attachment]})
    }
}

