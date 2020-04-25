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
    run: function run(message, args, bot){
        let targetTimezone = (args[1] && args[1].toUpperCase()) || message.getSetting("time.zone") || (message.guild && regionTimezones[message.guild.region]) || "GMT";
        const time = new Date();
        if(bot.util.timezones[targetTimezone]){
            time.setHours(time.getHours()+parseInt(bot.util.timezones[targetTimezone]));
        }else{
            const regexMatch = bot.util.timezoneRegex.exec(targetTimezone);
            if(regexMatch){
                try {
                    time.setHours(time.getHours() + parseInt(regexMatch[2]));
                }catch(e){
                    console.log(e);
                    message.replyLang("TIME_INVALID_TIMEZONE");
                    return;
                }
            }else{
                console.log(targetTimezone);
                message.replyLang("TIME_INVALID_TIMEZONE");
                return;
            }
        }



        const timeMessage = time.toString();

        if(timeMessage === "Invalid Date"){
            message.channel.send("https://i.imgur.com/eAhW2Sy.png");
        }else {

            let twelveHourTime = time.getHours() <= 12 ? time.getHours() : time.getHours() - 12;

            let emoji = `:clock${twelveHourTime}${(time.getMinutes() >= 30) ? "30" : ""}:`;
            if(!message.getBool("wholesome")) {
                if (time.getHours() === 1 && time.getMinutes() === 15) emoji = "It's a quarter after one I'm all alone and I need you now - ";
                if (time.getHours() === 3 && time.getMinutes() === 0) emoji = "It's 3AM I'm calling just to tell you that without you here, I'm losing sleep\n";
                if (twelveHourTime === 4 && time.getMinutes() === 20) emoji = "<:weed:478962396296380422>";
                if (time.getHours()=== 4 && time.getMinutes() === 30) emoji = "At 4:30 in the morning I'm milking cows, Jedediah feeds the chickens and Jacob plows -";
                if (time.getHours() === 5 && time.getMinutes() === 0) emoji = "It's 5 o'clock in the morning, conversation got boring - ";
                if (time.getHours() === 7 && time.getMinutes() === 0 && time.getDay() === 5) emoji = "7AM waking up in the morning gotta be fresh gotta go downstairs -";
                if (time.getHours() === 7 && time.getMinutes() === 45 && time.getDay() === 5) emoji = "7:45 we're driving on the highway -";
                if (twelveHourTime === 9 && time.getMinutes() === 11) emoji = ":airplane: :office: :office:";
                if (time.getHours() === 0 && time.getMinutes() === 15) emoji = "It's a quarter past midnight as we cut through the city -";
                if (twelveHourTime === 12 && time.getMinutes() === 34) emoji = "🔢";
            }
            message.replyLang("TIME_MESSAGE", {
                time: timeMessage.substring(0, timeMessage.indexOf("GMT")),
                emoji: emoji
            });
        }
    }
};