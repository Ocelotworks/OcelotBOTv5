const columnify = require('columnify');
const Sentry = require('@sentry/node');
const timescales = {
    all: "all",
    month: "month",
    monthly: "month",
    week: "week",
    weekly: "week",
    year: "year",
    yearly: "year",
}


module.exports = {
    name: "Leaderboards",
    usage: "leaderboard all/monthly/weekly/yearly server",
    commands: ["leaderboard", "lb"],
    run: async function(message, args, bot){

        let server = "global";

        if(!args[2] || args[2].toLowerCase() === "server") {
            args[2] = "all";
            if(args[2].toLowerCase() === "server")
                args[3] = "server";
        }


        if(args[3] && args[3].toLowerCase() === "server" && message.guild)
            server = message.guild.id;

        const timescale = timescales[args[2].toLowerCase()];

        if(!timescale)
            return message.channel.send(`:bangbang: The available leaderboards are: **all, year, month and week** Add **server** to see the leaderboard for this server, for example: **${args[0]} leaderboard year server**`);

        message.channel.startTyping();
        try {
            let span = bot.apm.startSpan("Get Translation Key");
            const unknownUserKey = await bot.lang.getTranslation(message.guild ? message.guild.id : "322032568558026753", "TRIVIA_UNKNOWN_USER");
            span.end();
            span = bot.apm.startSpan("Get Leaderboard");
            let leaderboard = await bot.util.getJson(`https://api.ocelot.xyz/leaderboard/guess/${server}/${timescale}`);
            span.end();
            if (!leaderboard.data || leaderboard.data.length === 0) {
                return message.channel.send(`There is no data for that timeframe. Try **${args[0]} leaderboard all** to see the all time scores.`);
            }
            span = bot.apm.startSpan("Get Position");
            let positionData = await bot.util.getJson(`https://api.ocelot.xyz/leaderboard/guess/${server}/${timescale}/${message.author.id}`);
            span.end();
            let outputData = [];

            span = bot.apm.startSpan("Create Table");
            for (let i = 0; i < leaderboard.data.length; i++) {
                const entry = leaderboard.data[i]
                let user;
                try {
                    user = await bot.util.getUserInfo(entry.user);
                } catch (e) {
                }
                outputData.push({
                    "#": i + 1,
                    "user": user ? `${user.username}#${user.discriminator}` : `${unknownUserKey} ${entry.user}`,
                    "Correct": entry.points,
                    "Total": entry.total,
                });
            }
            span.end();

            message.channel.send(`You are **#${(positionData.position + 1).toLocaleString()}** out of **${positionData.total.toLocaleString()}** total players${timescale === "all" ? " of all time" : ` this ${timescale}`}${server === "global" ? "." : " in this server."}\n\`\`\`yaml\n${columnify(outputData)}\n\`\`\``);
        }catch(e){
            Sentry.captureException(e);
            message.replyLang("GENERIC_ERROR");
        }finally{
            message.channel.stopTyping(true);
        }
    }
};