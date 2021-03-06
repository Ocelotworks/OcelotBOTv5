const regionTimezones = {
    "eu-west": "GMT",
    "eu-central": "GMT+2",
    "brazil": "GMT-3",
    "sydney": "GMT+10",
    "singapore": "GMT+8",
    "us-central": "CST",
    "us-west": "PST",
    "us-east": "EST",
    "us-south": "CST"
};


module.exports = {
    name: "Time",
    usage: "time [timezone]",
    accessLevel: 0,
    commands: ["time", "thetime"],
    categories: ["tools"],
    run: function run(message, args, bot) {
        let targetTimezone = (args[1] && args[1].toUpperCase()) || message.getSetting("time.zone") || (message.guild && regionTimezones[message.guild.region]) || "GMT";
        const time = new Date();
        if (bot.util.timezones[targetTimezone]) {
            time.setHours(time.getHours() + parseInt(bot.util.timezones[targetTimezone]));
        } else {
            const regexMatch = bot.util.timezoneRegex.exec(targetTimezone);
            if (regexMatch) {
                try {
                    time.setHours(time.getHours() + parseInt(regexMatch[2]));
                } catch (e) {
                    console.log(e);
                    message.replyLang("TIME_INVALID_TIMEZONE");
                    return;
                }
            } else {
                console.log(targetTimezone);
                message.replyLang("TIME_INVALID_TIMEZONE");
                return;
            }
        }


        const timeMessage = time.toString();

        if (timeMessage === "Invalid Date") {
            message.channel.send("https://i.imgur.com/eAhW2Sy.png");
        } else {

            let twelveHourTime = time.getHours() <= 12 ? time.getHours() : time.getHours() - 12;

            let emoji = `:clock${twelveHourTime}${(time.getMinutes() >= 30) ? "30" : ""}:`;
            if (!message.getBool("wholesome")) {
                if (twelveHourTime === 4 && time.getMinutes() === 20) emoji = "<:weed:478962396296380422>";
                if (twelveHourTime === 9 && time.getMinutes() === 11) emoji = ":airplane: :office: :office:";
                if (twelveHourTime === 12 && time.getMinutes() === 34) emoji = "🔢";
            }

            message.replyLang("TIME_MESSAGE", {
                time: timeMessage.substring(0, timeMessage.indexOf("GMT")),
                emoji: emoji
            });
        }
    }
};