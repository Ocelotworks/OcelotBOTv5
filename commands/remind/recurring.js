const later = require('later');
const regex = new RegExp(".*?( .* )[\“\”\"\‘\’\'\‚«»‹›「」『』﹃﹁﹄﹂《》〈〉](.*)[\“\”\"\‘\’\'\‚«»‹›「」『』﹃﹁﹄﹂《》〈〉]");
module.exports = {
    name: "Set Recurring Reminder",
    usage: "every <time> \"reminder message\"",
    commands: ["every", "everyday"],
    init: async function init(bot, reminderData){
        bot.client.once("ready", async ()=>{
            let servers = bot.client.guilds.cache.keyArray();
            let reminders = await bot.database.getRecurringRemindersForShard(bot.client.user.id, servers);
            if(bot.client.shard.ids[0] == "0")
                reminders.push(...(await bot.database.getRecurringRemindersForDMs(bot.client.user.id)));
            bot.logger.log(`Got ${reminders.length} recurring reminders.`);
            for(let i = 0; i < reminders.length; i++){
                let reminder = reminders[i];
                let scheduledReminder = later.setInterval(async ()=>{
                    try {
                        let channel = await bot.client.channels.fetch(reminder.channel);
                        await channel.send(reminder.message);
                    }catch(e){
                        console.log(e);
                        bot.raven.captureException(e);
                        scheduledReminder.clear();
                    }
                }, JSON.parse(reminder.recurrence));
                reminderData.recurringReminders[reminder.id] = scheduledReminder;
            }

        })

    },
    run: async function (message, args, bot, reminderData) {
        if(message.guild && !message.member.hasPermission("MANAGE_CHANNELS"))return message.channel.send("You must have the Manage Channels permission to use this command.");
        const input = args.slice(1).join(" ");
        let parse = later.parse.text(input);
        const rargs = regex.exec(message.content);
        let reminder;
        if (!rargs || rargs.length < 3) {
            if(parse.error === -1)
                return message.replyLang("REMIND_INVALID_MESSAGE");
            reminder = input.substring(parse.error);
        }else {
            if(input.indexOf(rargs[2])-1 !== parse.error){
                console.log(input.indexOf(rargs[2]), parse.error);
                if(parse.error === 0)
                    return message.channel.send(`Invalid time period. Try 'every 5 minutes' or 'every day at 10:15pm'.`);
                else
                    return message.channel.send(`Could only understand up to \`${input.substring(0, parse.error)}\`.`);

            }
            reminder = rargs[2];
        }


        if(parse.schedules.length === 0){
            return message.channel.send("Unable to parse time: Try something like 'every 5 minutes' or 'every day at 10:15pm'");
        }

        console.log("parsed time: ", parse.schedules);
        console.log("Exclusion", parse.exceptions);


        let occurrences = later.schedule(parse).nextRange(10);
        let tooShort = 0;

        if(occurrences.length === 1){
            tooShort = 10;
        }else {
            for (let i = 0; i < occurrences.length - 1; i++) {
                let first = occurrences[i][0];
                let second = occurrences[i + 1][0];

                if (!second || second - first < 10000) {
                    tooShort++;
                }
            }
        }

        if(tooShort > occurrences.length/2)
            return message.channel.send(":warning: Your message is too frequent. You must have at least 10 seconds between messages.");

        let schedule = parse.schedules[0];
        let output = ""

        if(schedule.t){
            output += "- at ";
            if(schedule.t.length === 1){
                output += parseTime(schedule.t[0]);
            }else if(schedule.t.length < 5){
                output += schedule.t.map(parseTime);
            }else{
                output += `${schedule.t.length} distinct times (${schedule.t.slice(0, 5).map(parseTime)}...)`
            }
            output += "\n";
        }

        output += "on:\n";

        output += parseScheduleArea(schedule.s, 60, "second", bot);
        output += parseScheduleArea(schedule.m, 60, "minute", bot);
        output += parseScheduleArea(schedule.h, 24, "hour", bot);
        output += parseScheduleArea(schedule.d, 7, "weekday", bot);
        output += parseScheduleArea(schedule.D, 31, "day", bot);
        output += parseScheduleArea(schedule.wy, 52, "week", bot);
        output += parseScheduleArea(schedule.M, 12, "month", bot);
        output += parseScheduleArea(schedule.Y, 481, "year", bot);

        if(parse.exceptions[0]){
            output += " EXCEPT on:\n";
            let exceptions = parse.exceptions[0];
            output += parseScheduleArea(exceptions.s, 60, "second", bot);
            output += parseScheduleArea(exceptions.m, 60, "minute", bot);
            output += parseScheduleArea(exceptions.h, 24, "hour", bot);
            output += parseScheduleArea(exceptions.d, 7, "weekday", bot);
            output += parseScheduleArea(exceptions.D, 31, "day", bot);
            output += parseScheduleArea(exceptions.wy, 52, "week", bot);
            output += parseScheduleArea(exceptions.M, 12, "month", bot);
            output += parseScheduleArea(exceptions.Y, 481, "year", bot);
        }

        let result = await bot.database.addRecurringReminder(bot.client.user.id, message.author.id, message.guild ? message.guild.id : null, message.channel.id, reminder, {schedules: parse.schedules, exceptions: parse.exceptions});

        // Making a lot of questionable decisions today
        if(output.endsWith("of "))
            output = output.substring(0, output.length-3)+".";


        // TODO unduplicate this
        let scheduledReminder = later.setInterval(async ()=>{
            try {
                await message.channel.send(reminder);
            }catch(e){
                console.log(e);
                bot.raven.captureException(e);
                scheduledReminder.clear();
            }
        }, parse);

        reminderData.recurringReminders[result[0]] = scheduledReminder;

        message.channel.send(`:white_check_mark: Successfully set recurring reminder.\nThe message:\n> ${reminder}\nWill be sent ${output}\nTo remove the reminder, type **${args[0]} remove ${result[0]}**`)
    }
}

function parseScheduleArea(scheduleArray, maximum, name, bot){
    let output = "";
    if(scheduleArray){
        output += "- ";
        if(scheduleArray.length === 1)
            output += `the **${bot.util.getNumberPrefix(scheduleArray[0])}** ${name}`;
        else if(scheduleArray.length < 5)
            output += `the **${scheduleArray.map(bot.util.getNumberPrefix)}** ${name}s`;
        else if(scheduleArray.length >= maximum)
            output += `every **${name}**`
        else
            output += `**${scheduleArray.length} distinct ${name}s** (${scheduleArray.slice(0, 5).map(bot.util.getNumberPrefix)}...)`
        output += "\n";
    }
    return output;
}

function parseTime(totalSeconds){
    let hours = Math.floor(totalSeconds/60/60);
    let minutes = Math.floor(totalSeconds/60 % 60);
    let seconds = Math.floor(totalSeconds % 60);
    return `${toFixed(hours)}:${toFixed(minutes)}:${toFixed(seconds)}`
}

function toFixed(time){
    if(time >= 10)
        return time;
    return "0"+time;
}