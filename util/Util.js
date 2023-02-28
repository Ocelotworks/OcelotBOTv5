const {axios} = require('./Http');
const Sentry = require('@sentry/node');
const Strings = require("./String");
const config = require('config');
const columnify = require("columnify");
const fs = require('fs');
module.exports = class Util {

    // Load a secret into the environment from a file, if the file path is set
    static LoadSecret(name){
        // Don't load if it's already set
        if(process.env[name])
            return;

        const secretEnv = name+"_FILE";
        if(process.env[secretEnv]){
            const value = fs.readFileSync(process.env[secretEnv]);
            process.env[name] = value.toString();
        }

    }

    static async GetSecret(name){
        if(process.env[name])
            return process.env[name];

        return new Promise((fulfill, reject)=>{
            const secretEnv = name+"_FILE";
            if(process.env[secretEnv]){
                fs.readFile(process.env[secretEnv], (err, data)=>{
                    if(err)
                        reject(err)
                    else
                        fulfill(data.toString());
                });
            }else{
                reject("Secret not found")
            }
        });
    }

    static async GetSecretSync(name){
        if(process.env[name])
            return process.env[name];
        const secretEnv = name+"_FILE";
        if(process.env[secretEnv]){
            return fs.readFileSync(process.env[secretEnv])?.toString()
        }
        return undefined;
    }

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
                description: argDescriptions?.[argument.name]?.name || argument.name,
                required: !argument.optional,
                autocomplete: argDescriptions?.[argument.name]?.autocomplete
            };
            switch(argument.type){
                case "options":
                    option.type = "STRING";
                    option.choices = argument.options.map((option)=>({name: argDescriptions?.[option]?.name || option, value: option}))
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
            return targetEmbed?.image?.url || targetEmbed?.image?.proxyURL;
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

        const attachedImage = context.message?.attachments?.filter((a)=>a.data?.content_type?.startsWith("image/") || a.proxyURL).first();

        if(attachedImage)
            return attachedImage.proxyURL;


        if(!context.channel?.permissionsFor?.(bot.client.user.id)?.has(["READ_MESSAGE_HISTORY", "VIEW_CHANNEL"])) {
            context.send(":warning: I need Read Message History and View Channel permissions to look for images.");
            return null;
        }

        if(context.message?.reference?.messageID){
            const message = await (await bot.client.channels.fetch(context.message.reference.channelID)).messages.fetch(context.message.reference.messageID);
            const messageImage = Util.#GetImageFromMessage(message);
            if(messageImage)
                return messageImage;
        }

        return Util.#GetImageFromPrevious(context, offset)
    }

    static async StandardPagination(bot, context, pages, pageFormat, full = false, dropdownItems){
        let index = parseInt(context.getSetting("pagination.page")) || 0;
        let sentMessage;
        let idleTimer;

        let clearButtons = async ()=>{
            //if(pages.length )
            if(context.interaction || (sentMessage && !sentMessage.deleted) && !context.channel?.deleted && (!context.guild || (context.guild.available && !context.guild.deleted))){
                try{
                    context.edit({...await pageFormat(pages[index], index), components: []}, sentMessage);
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
            if(pages > 2) {
                buttons = [
                    bot.interactions.addAction("<<", 1, async () => {
                        index = 0;
                        await buildPage()
                    }),
                    bot.interactions.addAction("<", 1, setIndex(-1)),
                    bot.interactions.addAction(">", 1, setIndex(+1)),
                    bot.interactions.addAction(">>", 1, async () => {
                        index = pages.length - 1;
                        await buildPage()
                    }),
                ]
            }
        }

        let dropdown;
        if((!full && pages.length > 4) || pages.length > 8){
            if(!dropdownItems)
                dropdownItems = Array(Math.min(pages.length-1, 25)).fill(1).map((_,i)=>({label: `Page ${i+1}`, value: `${i}`}));
            dropdown = bot.interactions.addDropdown("Go to page...", dropdownItems, (interaction)=>{
                index = parseInt(interaction.values[0]);
                buildPage();
            }, 0, 1);
        }

        console.log(buttons);

        let buildPage = async function () {
            let output = await pageFormat(pages[index], index);
            if(context.getBool("pagination.disable"))
                return context.send(output);

            let payload = output;
            if(pages.length > 1){
                if(dropdown){
                    payload.components = [{type: 1, components: [dropdown]}, {type:1, components: buttons}]
                }else{
                    payload.components = [{type:1, components: buttons}]
                }

                if(idleTimer)
                    clearTimeout(idleTimer);
                idleTimer = setTimeout(clearButtons, 60000);
            }

            if ((context.interaction && context.interaction.replied) || (sentMessage && !sentMessage.deleted) && (!context.guild || context.guild.available) && !context.channel?.deleted)
                return context.edit(payload, sentMessage)

            sentMessage = await context.send(payload)
        };

        await buildPage();
    }

    static GetServerCount(bot){
        return bot.rabbit.broadcastEval(`
            this.guilds.cache.filter((guild)=>guild.available).size;
        `).then((c)=>c.reduce((a, b)=>a+b, 0));
    }

    static GetUserCount(bot){
        return bot.rabbit.broadcastEval(`
            this.guilds.cache.filter((guild)=>guild.available).map((g)=>g.memberCount).reduce((a,b)=>a+b, 0);
        `).then((c)=>c.reduce((a, b)=>a+b, 0));
    }

    static async FetchMessages(channel, amount) {
        let iterations = Math.ceil(amount / 100);
        let before;
        let messages = [];
        for (let i = 0; i < iterations; i++) {
            let messageChunk = await channel.messages.fetch({before, limit: 100});
            messages = messages.concat(messageChunk.array());
            before = messageChunk.lastKey();
        }

        return messages;
    }

    /**
     * Get a random element from an array
     * @param {*[]} array
     * @returns {*}
     * @constructor
     */
    static ArrayRand(array){
        return array[Math.round(Math.random() * (array.length - 1))];
    }

    /**
     *
     * @param {Object} data
     * @param {string} target The value for the target user/server/whatever
     * @param keyField
     * @param keyMapping
     * @constructor
     */
    static async Leaderboard(data, target, keyField = "user", keyMapping){
        let position = -1;
        let output = "```asciidoc\n";
        let topTen = [];
        for(let i = 0; i < data.length; i++){
            if(data[i][keyField] === target){
                position = i;
                if(i >= 10)break;
            }
            if(i < 10) {
                if (keyMapping)
                    topTen.push(await keyMapping(data[i], i));
                else
                    topTen.push({
                        "#": (i + 1).toLocaleString(),
                        ...data[i],
                    })
            }
        }
        output += `${columnify(topTen)}\n\`\`\``
        return {output, position};
    }

    static ModalInput(label, custom_id, placeholder, required = false, value = placeholder, min_length = 1, max_length = 1){
        return {
            label, custom_id, placeholder, required, value, min_length, max_length, type: 1, style: 1
        }
    }
}