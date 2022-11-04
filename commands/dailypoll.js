const Embeds = require("../util/Embeds");
const Strings = require("../util/String");
module.exports = {
    name: "Daily Poll",
    usage: "dailypoll",
    detailedDescription: "A daily global poll to survey OcelotBOT users",
    commands: ["dailypoll"],
    categories: ["meta"],
    init: function(bot) {
        bot.interactions.addHandler("D", async (interaction, context) => {
            if(interaction.message.createdAt.getDate() !== new Date().getDate())
                return context.send({content: "That poll has expired! Type /dailypoll to get the latest poll.", ephemeral: true});
            let [encodedPollID, encodedOptionID] = interaction.customId.substring(1).split(":");
            const pollID = Strings.CommandIdToNumber(encodedPollID);
            const optionID = Strings.CommandIdToNumber(encodedOptionID);
            await bot.database.logDailyPollAnswer(context.user.id, pollID, optionID);
            const [poll, answers] = await Promise.all([
                bot.database.getDailyPoll(pollID),
                bot.database.getDailyPollAnswers(pollID)
            ]);
            let totalAnswers = Object.keys(answers).reduce((acc, ans)=>acc+(answers[ans]||0), 0);

            const embed = interaction.message.embeds[0];
            const expiry = new Date();
            expiry.setHours(0, 0, 0, 0);
            expiry.setDate(expiry.getDate()+1)
            embed.description = context.getLang("POLL_RESPONSES_EXPIRY", {
                num: totalAnswers,
                timestamp: Math.floor(expiry.getTime()/1000)
            });

            embed.fields = [];
            const inline = poll.options.length > 10;
            for(let i = 0; i < poll.options.length; i++){
                const option = poll.options[i];
                const percentage = answers[option.id] > 0 ? Math.round((answers[option.id]/totalAnswers)*100) : 0;
                embed.addField(option.name, `${Strings.ProgressBar(answers[option.id], totalAnswers, inline ? 5 : 10)} ${percentage}%`, inline);
            }

            return context.edit({embeds: [embed]})
        });
    },
    run: async function (context, bot) {
        const poll = await bot.database.getDailyPoll();
        if(!poll)return context.send({ephemeral: true, content: "There is no daily poll yet today! Check back later."});
        const answers = await bot.database.getDailyPollAnswers(poll.id);
        let totalAnswers = Object.keys(answers).reduce((acc, ans)=>acc+answers[ans], 0);
        const expiry = new Date();
        expiry.setHours(0, 0, 0, 0);
        expiry.setDate(expiry.getDate()+1)
        let embed = new Embeds.LangEmbed(context);
        embed.setAuthor("Daily Poll", bot.client.user.avatarURL({size: 16}))
        embed.setTitle(Strings.Truncate(poll.title, 256));
        embed.setDescriptionLang("POLL_RESPONSES_EXPIRY", {
            num: totalAnswers,
           timestamp: Math.floor(expiry.getTime()/1000)
        })

        const inline = poll.options.length > 10;
        for(let i = 0; i < poll.options.length; i++){
            const option = poll.options[i];
            const percentage = answers[option.id] > 0 ? Math.round((answers[option.id]/totalAnswers)*100) : 0;
            embed.addField(option.name, `${Strings.ProgressBar(answers[option.id], totalAnswers, inline ? 5 : 10)} ${percentage}%`, inline);
        }
        const pollId = Strings.NumberToCommandId(BigInt(poll.id));
        let buttons = poll.options.map((o)=>({type: 2, style: 1, label: Strings.Truncate(o.name, 80), custom_id: `D${pollId}:${Strings.NumberToCommandId(BigInt(o.id))}`}))

        console.log(buttons);
        context.send({embeds: [embed], components: this.wrapButtons(buttons)});
    },
    wrapButtons(buttons){
        return buttons.chunk(5).map((chunk)=>({type:1, components: chunk}));
    },
};
