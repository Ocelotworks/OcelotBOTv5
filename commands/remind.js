/**
 * Created by Peter on 01/07/2017.
 */
const chrono = require('chrono-node');
const regex = new RegExp(".*?( .* )[\“\”\"\‘\’\'\‚«»‹›「」『』﹃﹁﹄﹂《》〈〉](.*)[\“\”\"\‘\’\'\‚«»‹›「」『』﹃﹁﹄﹂《》〈〉]");

module.exports = {
    name: "Reminders",
    usage: "remind <in> \"<message>\"",
    accessLevel: 0,
    commands: ["remind", "remindme", "reminder", "setreminder"],
    categories: ["tools"],
    init: function init(bot){

        //if(bot.client.user.username !== "OcelotBOT-Test") {
        bot.rabbit.channel.assertQueue("reminder");
        bot.rabbit.channel.consume("reminder", {"x-priority": bot.client.shard.id},function reminderConsumer(message){
            try {
                let reminder = JSON.parse(message.content);
                if(bot.client.channels.has(reminder.channel) || bot.client.shard.id === 0){
                    module.exports.sendReminder(reminder, bot);
                    bot.rabbit.channel.ack(message);
                }else
                    bot.rabbit.channel.nack(message);
            }catch(e){
                bot.raven.captureException(e);
                bot.logger.error(e);
            }
        });


        bot.client.on("ready", async function discordReady(){
            if(bot.client.user.username === "OcelotBOT-Test")
                return bot.logger.warn("Not loading reminders on test bot");

            if(!bot.remindersLoaded) {
                bot.remindersLoaded = true;
                bot.logger.log("Loading reminders...");
                const reminderResult = await bot.database.getReminders();
                const now = new Date().getTime();
                for (let i = 0; i < reminderResult.length; i++) {
                    const reminder = reminderResult[i];
                    if (bot.client.guilds.has(reminder.server)) {
                        bot.logger.log(`Reminder ${reminder.id} belongs to this shard.`);
                        const remainingTime = reminder.at - now;
                        if (remainingTime <= 0) {
                            bot.logger.log(`Reminder ${reminder.id} has expired.`);

                            module.exports.sendReminder(reminder, bot);
                        } else {
                            bot.util.setLongTimeout(function () {
                                module.exports.sendReminder(reminder, bot);
                            }, remainingTime);
                        }
                        if(bot.client.shard){
                            bot.client.shard.send({type: "claimReminder", payload: reminder.id});
                        }
                    }
                }
            }else{
                bot.logger.log("Prevented duplicate reminder loading");
            }
        });
        if(bot.client.shard && bot.client.shard.id === 0) {
            process.on("message", async function handleClaimedReminders(message) {
                if (message.type === "handleClaimedReminders") {
                    if(bot.orphanedRemindersLoaded)return bot.logger.warn("Prevented duplicate orphaned reminder loading");
                    bot.orphanedRemindersLoaded = true;
                    const now = new Date().getTime();
                    let orphanedReminders = await bot.database.getOrphanedReminders(message.payload);
                    bot.logger.log(`Found ${orphanedReminders.length} orphaned reminders.`);
                    for(let i = 0; i < orphanedReminders.length; i++){
                        let reminder = orphanedReminders[i];
                        bot.logger.log(`Reminder ${orphanedReminders[i].id} is orphaned.`);
                        const remainingTime = reminder.at - now;
                        if (remainingTime <= 0) {
                            bot.logger.log(`Reminder ${reminder.id} has expired.`);

                            module.exports.sendReminder(reminder, bot);
                        } else {
                            bot.util.setLongTimeout(function () {
                                module.exports.sendReminder(reminder, bot);
                            }, remainingTime);
                        }
                    }
                }
            });
        }
    },
    sendReminder: async function(reminder, bot){
        bot.logger.log(`Reminding ${reminder.id}: ${reminder.user}: ${reminder.message}`);
        if(bot.client.channels.has(reminder.channel)){
            const channel = bot.client.channels.get(reminder.channel);
            channel.send(await bot.lang.getTranslation(channel.guild.id, "REMIND_REMINDER", {
                username: reminder.user,
                date: new Date(reminder.timestamp).toString(),
                message: reminder.message
            }));
        }else{
            bot.logger.log("Reminder channel no longer exists, attempting to send it to the user instead...");
            try{
                const targetUser = await bot.client.fetchUser(reminder.user);
                if(targetUser){
                    const dm = await targetUser.createDM();
                    await dm.send(await bot.lang.getTranslation(reminder.channel, "REMIND_REMINDER", {
                        username: reminder.user,
                        date: new Date(reminder.timestamp).toString(),
                        message: reminder.message
                    }));
                }else{
                    bot.logger.log("Couldn't retrieve the user.");
                }
            }catch(e){
                bot.logger.error("Error whilst sending to user");
                bot.raven.captureException(e);
            }
        }
        try{
            await bot.database.removeReminder(reminder.id);
            bot.logger.log(`Removed reminder ${reminder.id}`);
        }catch(err){
            bot.logger.error(`Error removing reminder!!! This is bad!!! ${err.stack}`);
            bot.raven.captureException(err);
        }
    },
    run: async function(message, args, bot){
        if(!message.guild){
            message.channel.send(":warning: You cannot use this command in a DM channel.");
            return;
        }
        //Hacky hack hack
        message.content = message.content.replace(args[0], "in");
        console.log(message.content);
        const now = new Date();
        const rargs = regex.exec(message.content);
        const chronoParse = (chrono.parse(message.content, now))[0];
        let at = null;
        if(chronoParse && chronoParse.start)
            at = chronoParse.start.date();

        let reminder = null;
        if(!rargs || rargs.length < 3){
            if(chronoParse && chronoParse.text){
                const guessedContent = message.content.substring(message.content.indexOf(chronoParse.text)+chronoParse.text.length);
                if(guessedContent)
                    reminder = guessedContent;
                else {
                    message.replyLang("REMIND_INVALID_MESSAGE");
                    return;
                }
            }else{
                message.replyLang("REMIND_INVALID_MESSAGE");
                return;
            }
        }else{
            reminder = rargs[2];
        }

        if(!at){
            message.replyLang("REMIND_INVALID_TIME");
            return;
        }

        if(at.getTime() >= 253370764800000){
            message.replyLang("REMIND_LONG_TIME");
            return;
        }

        if(at.getTime() >= 2147483647000){
            message.channel.send(":stopwatch: You can't set a reminder for on or after 19th January 2038");
            return;
        }

        const offset = at - now;


        if(offset < 1000){
            message.replyLang("REMIND_SHORT_TIME");
            return;
        }
        try {
            const reminderResponse = await bot.database.addReminder("discord", message.author.id, message.guild.id, message.channel.id, at.getTime(), reminder);
            message.replyLang("REMIND_SUCCESS", {time: bot.util.prettySeconds((offset / 1000)+1), date: at.toString()});
            bot.util.setLongTimeout(async function () {
                try {
                    message.replyLang("REMIND_REMINDER", {
                        username: message.author.id,
                        date: now.toString(),
                        message: reminder
                    });
                    await bot.database.removeReminder(reminderResponse[0])
                }catch(e){
                    bot.raven.captureException(e);
                }
            }, offset);
        }catch(e){
            message.replyLang("REMIND_ERROR");
            bot.raven.captureException(e);
        }


    }
};