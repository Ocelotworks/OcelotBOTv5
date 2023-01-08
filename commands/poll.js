const chrono = require('chrono-node');
const Embeds = require("../util/Embeds");
const Strings = require("../util/String");
const titleRegex = /\[(.*)]/i
module.exports = {
    name: "Poll",
    usage: "poll :command :options?+",
    detailedHelp: "Separate each option in the poll with a comma. Optionally, you can specify a title with [brackets], or a time frame, or forever.",
    usageExample: "poll 2 days [Which animal is better?], Cats, Dogs",
    categories: ["tools"],
    commands: ["poll"],
    requiredPermissions: ["READ_MESSAGE_HISTORY", "EMBED_LINKS"],
    guildOnly: true,
    nestedDir: "poll",
    slashOptions: [{
        type: "STRING", name: "options", description: "Poll options separated by a comma (,)", required: true
    }, {
        type: "STRING", name: "title", description: "Poll Title", required: false,
    },{
        type: "BOOLEAN", name: "multiple", description: "Allow Multiple Entries", required: false,
    },{
        type: "BOOLEAN", name: "open", description: "Allow users to submit custom entries", required: false,
    },{
        type: "STRING", name: "expiry", description: "Enter a date or timeframe to end the poll in", required: false,
    }],
    init: function(bot){
        setInterval(async ()=>{
            let expiredPolls = await bot.database.getExpiredPolls([...bot.client.guilds.cache.keys()]);
            if(expiredPolls.length === 0)return;
            bot.logger.log(`${expiredPolls.length} polls expired.`);
            await bot.database.deleteExpiredPolls([...bot.client.guilds.cache.keys()]);
            for(let i = 0; i < expiredPolls.length; i++){
                try {
                    const poll = expiredPolls[i];
                    await this.expirePoll(bot, poll);
                }catch(e){
                    bot.logger.log(e);
                }
            }
        }, 60000);


        bot.client.on("messageUpdate", (oldMessage, newMessage)=>{
            if(
                oldMessage?.author?.id === bot.client.user.id && // Is sent by me
                oldMessage.embeds[0] && // Has an embed
                oldMessage.embeds[0].fields?.[0]?.value.startsWith("[") && // Hacky way of figuring out of this is a poll message
                oldMessage.components.length > 0 && // Has components
                !oldMessage.flags.has("SUPPRESS_EMBEDS") && newMessage.flags.has("SUPPRESS_EMBEDS")){ // Embeds have been suppressed{
                newMessage.edit({
                    content: "With this embed's death, the thread of prophecy is severed. Recreate the poll to restore the weave of fate, or persist in the doomed world you have created.",
                    components: [],
                });
            }
        })

        bot.interactions.addHandler("P", async (interaction, context)=>{
            try {
                let [answer, pollID] = interaction.customId.substring(1).split("/");
                let poll = await bot.database.getPoll(pollID);
                if (!poll) {
                    return context.sendLang({content: "POLL_DELETED_EXPIRED", ephemeral: true});
                }
                if(answer === "END" && poll.creatorID !== interaction.user.id)
                    return context.sendLang({content: "POLL_NOT_ALLOWED", ephemeral: true});

                let message = await (await bot.client.channels.fetch(poll.channelID)).messages.fetch(poll.messageID);
                let embed = message.embeds[0];
                if(answer === "OTHER" && poll.open){
                    if(interaction.type === "MESSAGE_COMPONENT")
                        return context.openForm({
                            custom_id: interaction.customId,
                            title: "Add Poll Option",
                            components: [{
                                type: 1,
                                components: [{
                                    type: 4,
                                    custom_id: "answer",
                                    label: Strings.Truncate(embed.title, 45),
                                    style: 1,
                                    min_length: 1,
                                    max_length: 80,
                                    required: true
                                }]
                            }]
                        });

                    const newOption = interaction.components[0].components[0].value;

                    answer = embed.fields.findIndex((f)=>f.name.toLowerCase() === newOption.toLowerCase());
                    if(answer === -1){
                        answer = embed.fields.length;
                        embed.addField(newOption, `If you see this, something has gone wrong. Contact ${bot.lang.ownerTag}!`);
                        let newOptionButton = {type: 2, style: 1, label: newOption, custom_id: `P${answer}/${pollID}`};
                        const buttons = this.unwrapButtons(message.components);
                        buttons.splice(buttons.length-2, 0, newOptionButton);
                        // Disable the "Other" buttons when you get to 25 buttons
                        if(buttons.length > 24)buttons[buttons.length-2].disabled = true;
                        message.components = this.wrapButtons(buttons);
                    }
                }

                const now = new Date();
                if((poll.expires && poll.expires < now) || answer === "END"){
                    embed.setDescription(embed.description.split("\n")[0]);
                    embed.setColor("#ff0000");
                    embed.setFooter(context.getLang("POLL_EXPIRED"));
                    message.edit({embeds: [embed], components: []}).catch(console.error);
                    bot.database.deletePoll(message.guild.id, pollID);
                    if(answer === "END")
                        return
                    return context.sendLang({content: "POLL_EXPIRED", ephemeral: true});
                }
                if(poll.multiple)
                    await bot.database.togglePollAnswer(poll.id, interaction.user.id, answer);
                else
                    await bot.database.setPollAnswer(poll.id, interaction.user.id, answer);

                if(!embed){
                    return context.sendLang({ephemeral: true, content: "POLL_VOTE_EMBED_DELETED"});
                }

                await this.renderPollAnswers(bot, message, poll, context);
                if(poll.expires)
                    embed.description += `\nExpires <t:${Math.floor(poll.expires.getTime() / 1000)}:R>`
                return context.edit({embeds: [embed], components: message.components})
            }catch(e){
                console.error(e);
                return context.sendLang({content: "GENERIC_ERROR", ephemeral: true});
            }
        })
    },
    async expirePoll(bot, poll, context){
        let message = await (await bot.client.channels.fetch(poll.channelID)).messages.fetch(poll.messageID);
        if(!message)return;
        if(message.author.id !== bot.client.user.id)return;
        let embed = message.embeds[0];
        if(!embed){
            return message.edit({components: [], content: "Someone ruined the poll by deleting the embed :("});
        }
        embed.setDescription(embed.description.split("\n")[0]);
        embed.setColor("#ff0000");
        embed.setFooter(context ? context.getLang("POLL_EXPIRED") : "Poll Expired."); // TODO: contexts here
        await message.edit({embeds: [embed], components: []}).catch(console.error);
    },
    async renderPollAnswers(bot, message, poll, context){
        let answers = await bot.database.getPollAnswers(poll.id);
        let totalAnswers = 0;
        const keys = Object.keys(answers);
        for(let i = 0; i < keys.length; i++){
            totalAnswers += answers[keys[i]];
        }
        let embed = message.embeds[0];
        if(poll.multiple){
            let respondents = await bot.database.getUniquePollRespondents(poll.id);
            embed.description = context.getLang("POLL_RESPONSE_MULTIPLE", {respondents, totalAnswers})
        }else {
            embed.description = context.getLang(totalAnswers === 1 ? "POLL_RESPONSE" : "POLL_RESPONSES", {num: totalAnswers});
        }
        let inline = embed.fields.length > 10;
        for(let i = 0; i < embed.fields.length; i++){
            const count = answers[i] || 0;
            embed.fields[i] = {
                name: embed.fields[i].name,
                value: `${Strings.ProgressBar(count, totalAnswers, inline ? 5 : 10)} ${totalAnswers > 0 ? Math.floor(((count/totalAnswers)*100)) : "0"}%`,
                inline,
            }
        }
    },
    wrapButtons(buttons){
        return buttons.chunk(5).map((chunk)=>({type:1, components: chunk}));
    },
    unwrapButtons(components){
        return components.flatMap((c)=>c.components);
    },
    handleError: function(context){
        return context.sendLang({content: "POLL_HELP", ephemeral: true});
    },
    run: async function (context, bot) {
        const fullOptions = (context.options.command || "") + " " + (context.options.options || "")
        let options = fullOptions.split(',');
        if (options.length < 2 && !context.options.open)
            return context.sendLang({content: "POLL_MINIMUM", ephemeral: true});

        if (options.length > 24 || (options.length > 23 && !!context.options.open))
            return context.send({content: "POLL_MAXIMUM", ephemeral: true});

        const now = new Date();
        let title = context.options.title || titleRegex.exec(options[0])?.[1] || "Poll";
        if(!context.options.title)
            options[0] = options[0].replace(titleRegex, "").trim();
        if(options[0].length === 0)
            options.splice(0,1);
        options = options.map((o)=>o.trim())
        const time = chrono.parse(context.options.expiry || options[0], now, {forwardDate: true})[0]
        let expires = time?.start?.date();
        if(context.interaction){
            if(!context.options.expiry)
                expires = null;
        }else {
            if (expires) {
                options[0] = options[0].substring(time.index + time.text.length).trim();
            } else if (options[0].toLowerCase().startsWith("forever")) {
                expires = null;
                options[0] = options[0].substring(7).trim();
            } else {
                expires = null;
            }
        }

        if(options[0].toLowerCase() === "multiple"){
            options.splice(0, 1);
            context.options.multiple = true;
        }

        if(expires != null && expires.getTime() >= 2147483647000){
            return context.sendLang("POLL_EXPIRY_LONG");
        }

        const pollID = (await bot.database.createPoll(expires, context.guild.id, context.channel.id, context.user.id))[0]

        let embed = new Embeds.AuthorEmbed(context);
        embed.setTitle(Strings.Truncate(title, 256));
        embed.setDescriptionLang(expires ? "POLL_RESPONSES_EXPIRY" : "POLL_RESPONSES", {
            num: 0,
            timestamp: Math.floor(expires?.getTime()/1000)
        })

        if(expires) {
            embed.setFooterLang("POLL_ENDS");
            embed.setTimestamp(expires);
        }

        if(!!context.options.multiple){
            embed.setFooter(context.getLang("POLL_MULTIPLE_RESPONSES") + (embed.footer?.text || ""))
        }

        options = options.filter(o=>o.length);
        let buttons = options.map((o,i)=>({type: 2, style: 1, label: Strings.Truncate(o, 80), custom_id: `P${i}/${pollID}`}))

        if(!!context.options.open){
            buttons.push({type: 2, style: 3, label: "Other...", custom_id: `POTHER/${pollID}`})
        }

        const manage = bot.interactions.suggestedCommand(context, `manage ${pollID}`, {oneShot: false});
        manage.label = "Manage";
        buttons.push(manage);

        let inline = options.length > 10;
        for(let i = 0; i < options.length; i++){
            embed.addField(Strings.Truncate(options[i], 256), `${Strings.ProgressBar(0, 0, inline ? 5 : 10)} 0%`, inline);
        }
        let message = await context.send({embeds: [embed], components: this.wrapButtons(buttons)});

        return bot.database.updatePoll(context.guild.id, pollID, {
            messageID: message.id,
            multiple: !!context.options.multiple,
            open: !!context.options.open,
        });
    }
};