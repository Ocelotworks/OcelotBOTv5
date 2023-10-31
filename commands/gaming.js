const {Util} = require("discord.js");
const {AuthorEmbed} = require("../util/Embeds");
const Strings = require("../util/String");
const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const gamerReminders = ["Today is the day for GAMING",
    "What's up GAMERS hope you're ready to GAME today",
    "Today we game",
    "Gaming time gaming time",
    "number one victory royale at 8PM tonight",
    "gamers unite tonight at 8pm",
    "Tell Neil to get a shower early because tonight we GAME",
    "Gaming tonight at 8pm, or realistically more like 9",
    "Tonight we game",
    "8pm tonight gaming be there or be square"
]
module.exports = {
    name: "Gaming Request",
    usage: "gaming :0range?",
    categories: ["tools"],
    requiredPermissions: [],
    commands: ["gaming"],
    commandPack: "ocelotworks",
    hidden: true,
    argDescriptions: {
        range: {name: "The number of days to include in the message. Defaults to 7 days"},
    },
    init: function init(bot) {
        bot.interactions.addHandler("M", async (interaction, context) => {
            const message = await context.channel.messages.fetch(interaction.customId.substring(1));
            if(!message){
                return context.send({ephemeral: true, content: `<:peter:478962397281779713> umm.. tell peter you got this error (message not found)`})
            }
            const embed = message.embeds[0];
            const votes = this.parseEmbed(embed);

            for(let i = 0; i < votes.length; i++){
                if(!votes[i])continue;
                for(let j = 0; j < votes[i].length; j++){
                    if(votes[i][j].userid === context.user.id){
                        votes[i][j].preference = i === +interaction.values[0].split("_")[1];
                    }
                }
            }

            embed.fields = this.createEmbedFields(votes, embed.timestamp);
            interaction.deferUpdate();
            return message.edit({embeds: [embed]})
        })

        bot.interactions.addHandler("N", async (interaction, context)=>{
            const parsedDate = interaction.customId.substring(1);
            const now = new Date();
            // This is stupid, but what can you do
            const at = new Date(parsedDate.replace(/rd|nd|st|th/, ""));
            // This check will pass because we can never have the same date on a different month or year
            if(at.getDate() === now.getDate()){
                // set the reminder at 6pm UTC if it's the current day
                at.setUTCHours(18, 0, 0)
            }else{
                // Else set the reminder at midday
                at.setUTCHours(12, 0, 0)
            }

            const reminder = bot.util.arrayRand(gamerReminders);
            const reminderResponse = await bot.database.addReminder(bot.client.user.id, context.user.id, context.guild ? context.guild.id : null, context.channel.id, at.getTime(), reminder, context.message?.id);
            context.send({content: `Reminder has been set. To remove, use /remind remove ${reminderResponse[0]}`, ephemeral: true});
            context.channel.send(`<@${context.user.id}> has set a reminder for gaming at <t:${Math.floor(at.getTime()/1000)}>`)
            // reminder ID = reminderResponse[0]
        })


        bot.interactions.addHandler("G", async (interaction, context) => {
            const embed = interaction.message.embeds[0];
            const votes = this.parseEmbed(embed).map((votes)=>votes.filter((v)=>v.userid !== context.user.id));

            const optionData = interaction.message.components[0].components[0].options;
            const selectedOptions = interaction.values.map((v) => optionData[v.split("_")[1]]);

            for(let i = 0; i < selectedOptions.length; i++){
                const option = selectedOptions[i];
                const dayNum = option.value.split("_")[1];
                const obj = {userid: context.user.id, preference: selectedOptions.length === 1};
                if(!votes[dayNum]){
                    votes[dayNum] = [obj]
                }else{
                    votes[dayNum].push(obj);
                }
            }
            embed.fields = this.createEmbedFields(votes, embed.timestamp);
            interaction.message.edit({embeds: [embed]});

            if (interaction.values.length === 1) {
                return context.send({
                    ephemeral: true,
                    content: `Your choice has been registered.`,
                })
            }

            const buttonRow = bot.util.actionRow({
                type: 3,
                custom_id: `M${interaction.message.id}`,
                options: selectedOptions,
                min_values: 0,
                max_values: 1
            })
            context.send({
                ephemeral: true,
                content: `Your ${interaction.values.length} choices have been registered. If you have a preferred day, select it below.`,
                components: [buttonRow],
            })
        })

        bot.interactions.addHandler("C", async (interaction, context) => {
            const embed = interaction.message.embeds[0];
            const votes = this.parseEmbed(embed);

            let uniqueUsers = [...new Set(votes.flatMap((vote)=>vote.map((v)=>v.userid)))];
            console.log(uniqueUsers);
            let bestDayIndex = -1;
            let bestDayScore = 0;
            let bestDayHasAllUsers = false;
            for(let i = 0; i < votes.length; i++){
                const vote = votes[i];
                if(!vote)continue;
                let score = vote.reduce((acc, val)=>acc+(val.preference ? 2 : 1), 0);
                const votedUsers = vote.map((v)=>v.userid);
                let hasAllUsers = true;
                for(let j = 0; j < votedUsers.length; j++){
                    if(!uniqueUsers.includes(votedUsers[j])){
                        hasAllUsers = false;
                        break
                    }
                }
                if(hasAllUsers){
                    score += 10;
                }
                if(score > bestDayScore){
                    bestDayScore = score;
                    bestDayIndex = i;
                    bestDayHasAllUsers = hasAllUsers;
                }
            }

            if(bestDayIndex < 0){
                return context.send({ephemeral: true, content: "Wait for people to vote before pressing this button..."});
            }

            const optionData = interaction.message.components[0].components[0].options;

            console.log(votes, optionData);
            let content = `⭐ The best date currently is: ${optionData[bestDayIndex].label} ${optionData[bestDayIndex].description}`;
            if(!bestDayHasAllUsers){
                content += "\n😟 Not all users who voted are available on this day"
            }

            const setReminder = bot.util.actionRow({
                type: 2,
                style: 1,
                label: "Set Reminder (Not silent)",
                custom_id: `N${optionData[bestDayIndex].description}`
            })
            context.send({
                content,
                ephemeral: true,
                components: [setReminder],
            })
        })
    },
    parseEmbed: function (embed) {
        let output = [];
        for (let field of embed.fields) {
            const {name, value} = field;
            output[name.split(":")[0]-1] = value.split(" ").map((vote) => ({
                preference: vote[0] === "⭐",
                userid: vote.substring(vote.indexOf("@") + 1, vote.indexOf(">"))
            }));
        }
        return output;
    },
    createEmbedFields: function(votes, now){
        let fields = [];
        for(let i = 0; i < votes.length; i++){
            const vote = votes[i];
            if(!vote || !vote.length)continue;
            const newDate = new Date(now);
            newDate.setDate(newDate.getDate()+i);
            fields.push({
                name: `${i+1}: ${daysOfWeek[newDate.getDay()]} (${britishDate(newDate)})`,
                value: vote.map(({preference, userid})=>`${preference ? "⭐":""}<@${userid}>`).join(" ")
            })
        }
        return fields;
    },
    run: async function (context, bot) {
        if (!context.getBool("ocelotworks")) return;
        const days = context.options.range || 7;
        if (days < 2) {
            return context.send({
                ephemeral: true,
                content: "<:peter_bored:645030787053518878> You need at least 3 days."
            });
        }
        if (days > 25) {
            return context.send({
                ephemeral: true,
                content: "<:peter_bored:645030787053518878> You can't have more than 25 days. Be reasonable now."
            });
        }
        const now = new Date();
        if (now.getHours() > 20)
            now.setDate(now.getDate() + 1);

        const embed = new AuthorEmbed(context);

        embed.setTitle(`${context.member.nickname || context.user.username} wants to game soon`);
        embed.setDescription("Select the days that you are free from the dropdown.");
        embed.setTimestamp(now);

        const dropdown = bot.util.actionRow({
            type: 3, custom_id: `G${now.getTime()}`, options: Array(days).fill(1).map((_, i) => {
                const newDate = new Date(now);
                newDate.setDate(newDate.getDate() + i);
                return {
                    label: `${daysOfWeek[newDate.getDay()]}`,
                    description: britishDate(newDate),
                    value: "day_" + i,
                }
            }), placeholder: `${days} days available`, min_values: 0, max_values: days
        });

        const findRow = bot.util.actionRow({
            type: 2,
            style: 1,
            label: "Calculate best day",
            custom_id: `CALCULATE`
        })

        return context.send({embeds: [embed], components: [dropdown, findRow]})
    }
};
// God Save The King
function britishDate(date){
    return `${Strings.GetNumberPrefix(date.getDate())} ${Strings.Months[date.getMonth()]} ${date.getFullYear()}`
}