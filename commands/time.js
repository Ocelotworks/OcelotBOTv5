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
    usage: "time :timezone?",
    accessLevel: 0,
    commands: ["time", "thetime"],
    categories: ["tools"],
    run: function run(context, bot) {
        let targetTimezone = (context.options.timezone && context.options.timezone.toUpperCase()) || context.getSetting("time.zone") || (context.guild && regionTimezones[context.guild.region]) || "GMT";
        const time = new Date();
        time.setHours(time.getHours() +  bot.util.parseTimeZone(targetTimezone));

        const timeMessage = time.toString();

        if (timeMessage === "Invalid Date")
            return context.send("https://i.imgur.com/eAhW2Sy.png");


        let twelveHourTime = time.getHours() <= 12 ? time.getHours() : time.getHours() - 12;

        let emoji = `:clock${twelveHourTime === 0 ? 12 : twelveHourTime}${(time.getMinutes() >= 30) ? "30" : ""}:`;
        if (!context.getBool("wholesome")) {
            if (twelveHourTime === 4 && time.getMinutes() === 20) emoji = "<:weed:478962396296380422>";
            if (twelveHourTime === 9 && time.getMinutes() === 11) emoji = ":airplane: :office: :office:";
        }
        if (twelveHourTime === 12 && time.getMinutes() === 34) emoji = "🔢";

        context.sendLang("TIME_MESSAGE", {
            time: timeMessage.substring(0, timeMessage.indexOf("GMT")),
            emoji: emoji
        });
    }
};