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


        bot.interactions.addHandler("P", async (interaction, context)=>{
            try {
                const [answer, pollID] = interaction.customId.substring(1).split("/");
                let poll = await bot.database.getPoll(pollID);
                if (!poll) {
                    return context.sendLang({content: "POLL_DELETED_EXPIRED", ephemeral: true});
                }
                if(answer === "END" && poll.creatorID !== interaction.user.id)
                    return context.sendLang({content: "POLL_NOT_ALLOWED", ephemeral: true});
                let message = await (await bot.client.channels.fetch(poll.channelID)).messages.fetch(poll.messageID);
                const now = new Date();
                if((poll.expires && poll.expires < now) || answer === "END"){
                    let embed = message.embeds[0];
                    embed.setDescription(embed.description.split("\n")[0]);
                    embed.setColor("#ff0000");
                    embed.setFooter("Poll Expired");
                    message.edit({embeds: [embed], components: []}).catch(console.error);
                    bot.database.deletePoll(message.guild.id, pollID);
                    if(answer === "END")
                        return
                    return context.send({content: "POLL_EXPIRED", ephemeral: true});
                }
                if(poll.multiple)
                    await bot.database.togglePollAnswer(poll.id, interaction.user.id, answer);
                else
                    await bot.database.setPollAnswer(poll.id, interaction.user.id, answer);

                let embed = message.embeds[0];
                await this.renderPollAnswers(bot, message, poll);
                if(poll.expires)
                    embed.description += `\nExpires <t:${Math.floor(poll.expires.getTime() / 1000)}:R>`
                return context.edit({embeds: [embed]})
            }catch(e){
                console.error(e);
                return context.sendLang({content: "GENERIC_ERROR", ephemeral: true});
            }
        })
    },
    async expirePoll(bot, poll){
        let message = await (await bot.client.channels.fetch(poll.channelID)).messages.fetch(poll.messageID);
        if(!message)return;
        if(message.author.id !== bot.client.user.id)return;
        let embed = message.embeds[0];
        embed.setDescription(embed.description.split("\n")[0]);
        embed.setColor("#ff0000");
        embed.setFooter("Poll Expired");
        await message.edit({embeds: [embed], components: []}).catch(console.error);
    },
    async renderPollAnswers(bot, message, poll){
        let answers = await bot.database.getPollAnswers(poll.id);
        let totalAnswers = 0;
        const keys = Object.keys(answers);
        for(let i = 0; i < keys.length; i++){
            totalAnswers += answers[keys[i]];
        }
        let embed = message.embeds[0];
        if(poll.multiple){
            let respondents = await bot.database.getUniquePollRespondents(poll.id);
            embed.description = `${respondents} Respondents / ${totalAnswers} Responses`;
        }else {
            embed.description = totalAnswers === 1 ? "1 Response" : `${totalAnswers} Responses`;
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
    handleError: function(context){
        return context.sendLang({content: "POLL_HELP", ephemeral: true});
    },
    run: async function (context, bot) {
        const fullOptions = (context.options.command || "") + " " + (context.options.options || "")
        let options = fullOptions.split(',');
        if (options.length < 2)
            return context.sendLang({content: "POLL_MINIMUM", ephemeral: true});

        if (options.length > 24)
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

        if(expires != null && expires.getTime() >= 2147483647000){
            return context.send(`:stopwatch: A poll can't expire on or after the 19th of January 2038. If you need a poll that lasts forever, use **${context.getSetting("prefix")}poll forever, a, b, c**`);
        }

        const pollID = (await bot.database.createPoll(expires, context.guild.id, context.channel.id, context.user.id))[0]

        let embed = new Embeds.AuthorEmbed(context);
        embed.setTitle(title);
        embed.setDescriptionLang(expires ? "POLL_RESPONSES_EXPIRY" : "POLL_RESPONSES", {
            num: 0,
            timestamp: Math.floor(expires?.getTime()/1000)
        })

        if(expires) {
            embed.setFooterLang("POLL_ENDS");
            embed.setTimestamp(expires);
        }

        if(!!context.options.multiple){
            embed.setFooter("Allows Multiple Responses. " + (embed.footer?.text || ""))
        }

        options = options.filter(o=>o.length);
        let buttons = options
            .map((o,i)=>({type: 2, style: 1, label: Strings.Truncate(o, 80), custom_id: `P${i}/${pollID}`}))
            .chunk(5)
            .map((bGroup)=>({type: 1, components: bGroup}));


        const end = bot.interactions.suggestedCommand(context, `manage ${pollID}`, {oneShot: false});
        end.label = "Manage";

        if(buttons[buttons.length-1].components.length < 4)
            buttons[buttons.length-1].components.push(end);
        else
            buttons.push({type: 1, components: [end]});


        let inline = options.length > 10;
        for(let i = 0; i < options.length; i++){
            embed.addField(Strings.Truncate(options[i], 256), `${Strings.ProgressBar(0, 0, inline ? 5 : 10)} 0%`, inline);
        }
        let message = await context.send({embeds: [embed], components: buttons});

        return bot.database.updatePoll(context.guild.id, pollID, {
            messageID: message.id,
            multiple: !!context.options.multiple
        });
    }
};