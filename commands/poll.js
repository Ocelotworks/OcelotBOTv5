const chrono = require('chrono-node');
const Embeds = require("../util/Embeds");
const Strings = require("../util/String");
const titleRegex = /\[(.*)]/i
module.exports = {
    name: "Poll",
    usage: "poll :options+",
    detailedHelp: "Separate each option in the poll with a comma. Optionally, you can specify a title with [brackets], or a time frame, or forever.",
    categories: ["tools"],
    commands: ["poll"],
    init: function(bot){
        if(bot.util.shard === 0){
            setInterval(async ()=>{
                let expiredPolls = await bot.database.getExpiredPolls();
                if(expiredPolls.length === 0)return;
                bot.logger.log(`${expiredPolls.length} polls expired.`);
                await bot.database.deleteExpiredPolls();
                for(let i = 0; i < expiredPolls.length; i++){
                    try {
                        const poll = expiredPolls[i];
                        let message = await (await bot.client.channels.fetch(poll.channelID)).messages.fetch(poll.messageID);
                        if(!message)continue;
                        let embed = message.embeds[0];
                        embed.setDescription(embed.description.split("\n"));
                        embed.setColor("#ff0000");
                        embed.setFooter("Poll Expired");
                        await message.edit({embeds: [embed], components: []}).catch(console.error);
                    }catch(e){
                        bot.logger.log(e);
                    }
                }
            }, 60000);
        }

        bot.interactions.addHandler("P", async (interaction)=>{
            try {
                const [answer, pollID] = interaction.data.custom_id.substring(1).split("/");
                let poll = await bot.database.getPoll(pollID);
                if (!poll) {
                    return {type: 4, data: {flags: 64, content: "The poll has expired or is invalid."}};
                }
                let message = await (await bot.client.channels.fetch(poll.channelID)).messages.fetch(poll.messageID);
                if(poll.expires && poll.expires < new Date()){
                    let embed = message.embeds[0];
                    embed.setDescription(embed.description.split("\n"));
                    embed.setColor("#ff0000");
                    embed.setFooter("Poll Expired");
                    message.edit({embeds: [embed], components: []}).catch(console.error);
                    return {type: 4, data: {flags: 64, content: "That poll has expired."}};
                }
                await bot.database.setPollAnswer(poll.id, interaction.member.user.id, answer);
                let answers = await bot.database.getPollAnswers(poll.id);
                let totalAnswers = 0;
                const keys = Object.keys(answers);
                for(let i = 0; i < keys.length; i++){
                    totalAnswers += answers[keys[i]];
                }
                let embed = message.embeds[0];
                embed.description = totalAnswers === 1 ? "1 Response" : `${totalAnswers} Responses`;
                if(poll.expires)
                    embed.description += `\nExpires <t:${Math.floor(poll.expires.getTime() / 1000)}:R>`
                let inline = embed.fields.length > 10;
                for(let i = 0; i < embed.fields.length; i++){
                    const count = answers[i] || 0;
                    embed.fields[i] = {
                        name: embed.fields[i].name,
                        value: `${Strings.ProgressBar(count, totalAnswers, inline ? 5 : 10)} ${Math.floor(((count/totalAnswers)*100))}%`,
                        inline,
                    }
                }
                await message.edit({embeds: [embed]})
            }catch(e){
                console.error(e);
                return {type: 4, data: {flags: 64, content: "Something went wrong recording your poll answer."}};
            }
            return {type: 6};
        })
    },
    run: async function (context, bot) {
        let options = context.options.options.split(',');
        if (options.length < 2)
            return context.send({content:`:bangbang: You need to enter at least 2 poll items. For example, ${context.command} Dogs, Cats`, ephemeral: true});

        if (options.length > 25)
            return context.send(":bangbang: You can only enter a maximum of 25 poll options.");

        const now = new Date();
        let title = titleRegex.exec(options[0])?.[1] || "Poll";
        options[0] = options[0].replace(titleRegex, "").trim();
        if(options[0].length === 0)
            options.splice(0,1);
        options = options.map((o)=>o.trim())
        const time = chrono.parse(options[0], now, {forwardDate: true})[0]
        console.log(time);
        let expires = time?.start?.date();
        if(expires) {
            options[0] = options[0].substring(time.index+time.text.length).trim();
        }else if(options[0].toLowerCase().startsWith("forever")){
            expires = null;
            options[0] = options[0].substring(7).trim();
        }else{
            expires = new Date()
            expires.setMinutes(expires.getMinutes()+1);
        }

        const pollID = (await bot.database.createPoll(expires, context.guild.id, context.channel.id, context.user.id))[0]

        let embed = new Embeds.AuthorEmbed(context);
        embed.setTitle(title);
        if(expires)
            embed.setDescription(`0 Responses\nExpires <t:${Math.floor(expires.getTime()/1000)}:R>`);
        else
            embed.setDescription(`0 Responses`);
        if(expires) {
            embed.setFooter("Poll ends: ");
            embed.setTimestamp(expires);
        }

        options = options.filter(o=>o.length);
        let buttons = options
            .map((o,i)=>({type: 2, style: 1, label: Strings.Truncate(o, 80), custom_id: `P${i}/${pollID}`}))
            .chunk(5)
            .map((bGroup)=>({type: 1, components: bGroup}));
        let inline = options.length > 10;
        for(let i = 0; i < options.length; i++){
            embed.addField(options[i], `${Strings.ProgressBar(0, 0, inline ? 5 : 10)} 0%`, inline);
        }
        let message = await context.send({embeds: [embed], components: buttons})
        return bot.database.updatePoll(pollID, message.id);
    }
};