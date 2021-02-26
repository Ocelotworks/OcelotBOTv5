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
    init: function(bot){
        bot.client.on("message", async function onMessage(message) {
            if (message.guild && message.guild.id === "322032568558026753" && !message.author.bot && bot.client.user.id == "146293573422284800") {
                if (message.content.indexOf("discord.gg") > -1)
                    return message.delete();

                if (changePrefix.exec(message.content)) {
                    bot.util.replyTo(message, "To change the prefix, type !settings set prefix %\nWhere % is the prefix you want.");
                }
            }
        });


        async function updateLeaderboards(){
            if(bot.config.getBool("global", "leaderboard.enable")){
                await updateLeaderboard("guess.records", "guess/records", "total");
                await updateLeaderboard("guess", "guess/global", "total");
                await updateLeaderboard("trivia", "trivia/global", "total");
            }
        }

        async function updateLeaderboard(key, route, field){
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

        async function makeLeaderboard(type, totalField, time){
            const unknownUserKey = await bot.lang.getTranslation("322032568558026753", "TRIVIA_UNKNOWN_USER");
            const leaderboard = await bot.util.getJson(`https://api.ocelotbot.xyz/leaderboard/${type}/${time}?items=20`);
            let outputData = [];
            for (let i = 0; i < leaderboard.data.length; i++) {
                const entry = leaderboard.data[i]
                let user = await bot.util.getUserInfo(entry.user);
                let row = {
                    "#": i + 1,
                    "user": user ? `${user.username}#${user.discriminator}` : `${unknownUserKey} ${entry.user}`,
                };
                if(entry.points)
                    row["Correct"] = entry.points.toLocaleString();

                row[totalField] = entry[totalField].toLocaleString();

                outputData.push(row);
            }
            return (time === "month" ? "Monthly Scores:" : "All Time Scores:")+"\n```yaml\n"+columnify(outputData)+"\n```\nLast Updated:"+new Date().toLocaleString();
        }


        bot.client.on("ready", async function(){
            if(bot.client.guilds.cache.has("322032568558026753")){
                setTimeout(updateLeaderboards, 5000)
                setInterval(updateLeaderboards, 8.64e+7)
            }
        })


    }
};