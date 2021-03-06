/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 14/04/2019
 * ╚════ ║   (ocelotbotv5) support
 *  ════╝
 */
const columnify = require('columnify');
const changePrefix = /.*(change|custom).*prefix.*/gi;
module.exports = {
    name: "Support Server Specific Functions",
    init: function (bot) {
        bot.client.on("messageCreate", async function onMessage(message) {
            if (message.guild && message.guild.id === "322032568558026753" && !message.author.bot && bot.client.user.id == "146293573422284800") {
                if (message.content.indexOf("discord.gg") > -1)
                    return message.delete();

                if (changePrefix.exec(message.content)) {
                    bot.util.replyTo(message, "To change the prefix, type !settings set prefix %\nWhere % is the prefix you want.");
                }
            }
        });

        bot.client.on("guildMemberAdd", async (member)=>{
            if(member.guild.id !== "322032568558026753" || bot.client.user.id !== "146293573422284800")return;
            try {
                const commandCount = (await bot.database.getUserStats(member.id))[0].commandCount;
                if (commandCount > 0) return;
                bot.logger.log("Found suspicious account " + member.id);
                await member.edit({
                    roles: ["856657988629692486"]
                });

                let channel = await bot.client.channels.fetch("856658218948624444");
                await channel.send(`Welcome to the server, <@${member.id}>!\nWe require certain accounts to be screened before joining the server to avoid trolls/spammers. Please wait here and a <@&325967792128131084> or <@&439485569425211392> will be around shortly to let you in.`);
            }catch(e){
                bot.logger.error(e);
                bot.raven.captureException(e);
            }
        })


        async function updateLeaderboards() {
            if (bot.config.getBool("global", "leaderboard.enable")) {
                await updateLeaderboard("guess.records", "guess/records", "total");
                await updateLeaderboard("guess", "guess/global", "total");
                await updateLeaderboard("trivia", "trivia/global", "score");
            }
        }

        async function updateLeaderboard(key, route, field) {
            const channel = bot.config.get("global", `leaderboard.${key}.channel`);
            const allMessageId = bot.config.get("global", `leaderboard.${key}.all`);
            const monthlyMessageId = bot.config.get("global", `leaderboard.${key}.monthly`);
            console.log(key, route, field, channel, allMessageId, monthlyMessageId)
            let [allMessage, monthlyMessage] = await Promise.all([
                await bot.client.channels.cache.get(channel).messages.fetch(allMessageId),
                await bot.client.channels.cache.get(channel).messages.fetch(monthlyMessageId),
            ]);

            console.log("editing ", allMessageId)
            await allMessage.edit(await makeLeaderboard(route, field, "all"));
            console.log("editing ", monthlyMessageId)
            await monthlyMessage.edit(await makeLeaderboard(route, field, "month"));
        }

        async function makeLeaderboard(type, totalField, time) {
            const leaderboard = await bot.util.getJson(`https://api.ocelotbot.xyz/leaderboard/${type}/${time}?items=20`);
            let outputData = [];
            for (let i = 0; i < leaderboard.data.length; i++) {
                const entry = leaderboard.data[i]
                let row = {
                    "#": i + 1,
                    "user": await bot.util.getUserTag(entry.user),
                };
                if (entry.points)
                    row["Correct"] = entry.points.toLocaleString();

                row[totalField] = entry[totalField].toLocaleString();

                outputData.push(row);
            }
            return (time === "month" ? "Monthly Scores:" : "All Time Scores:") + "\n```yaml\n" + columnify(outputData) + "\n```\nLast Updated:" + new Date().toLocaleString();
        }


        bot.client.on("ready", async function () {
            if (bot.client.guilds.cache.has("322032568558026753")) {
                setTimeout(updateLeaderboards, 5000)
                setInterval(updateLeaderboards, 8.64e+7)
            }
        })


    }
};