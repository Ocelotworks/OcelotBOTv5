const {Util} = require("discord.js");
const {AuthorEmbed} = require("../util/Embeds");
const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
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

            console.log(interaction.values);

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
                name: `${i+1}: ${daysOfWeek[newDate.getDay()]} (${newDate.toLocaleDateString()})`,
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
                    description: newDate.toLocaleDateString(),
                    value: "day_" + i,
                }
            }), placeholder: `${days} days available`, min_values: 0, max_values: days
        });

        return context.send({embeds: [embed], components: [dropdown]})
    }
};