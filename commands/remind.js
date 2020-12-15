/**
 * Created by Peter on 01/07/2017.
 */
const chrono = require('chrono-node');
const regex = new RegExp(".*?( .* )[\“\”\"\‘\’\'\‚«»‹›「」『』﹃﹁﹄﹂《》〈〉](.*)[\“\”\"\‘\’\'\‚«»‹›「」『』﹃﹁﹄﹂《》〈〉]");

module.exports = {
    name: "Reminders",
    usage: "remind <in> \"<message>\"",
    accessLevel: 0,
    commands: ["remind", "remindme", "reminder", "setreminder", "reminders"],
    categories: ["tools"],
    // This doesn't feel right
    deletedReminders: [],
    recurringReminders: {},
    init: function init(bot){
        bot.util.standardNestedCommandInit('remind', 'remind', module.exports);
        bot.client.on("ready", function () {
            bot.rabbit.channel.assertQueue(`reminder-${bot.client.user.id}-${bot.client.shard.ids.join(";")}`, {exclusive: true});
            bot.rabbit.channel.consume(`reminder-${bot.client.user.id}-${bot.client.shard.ids.join(";")}`, function reminderConsumer(message) {
                try {
                    let reminder = JSON.parse(message.content);
                    if (bot.config.getBool("global", "remind.silentQueueTest")) {
                        bot.logger.warn("Silent test: got reminder from reminder worker");
                        bot.logger.log(reminder);
                    } else {
                        module.exports.sendReminder(reminder, bot);
                    }
                    bot.rabbit.channel.ack(message);
                } catch (e) {
                    bot.raven.captureException(e);
                    bot.logger.error(e);
                }
            });
        });


        bot.client.on("ready", async function discordReady(){
            if(!bot.remindersLoaded) {
                bot.client.shard.send({type: "claimReminder", payload: 0});
                bot.remindersLoaded = true;
                bot.logger.log("Loading reminders...");
                const reminderResult = await bot.database.getReminders(bot.client.user.id);
                const now = new Date().getTime();
                for (let i = 0; i < reminderResult.length; i++) {
                    const reminder = reminderResult[i];
                    console.log(reminder);
                    if (reminder.server && bot.client.guilds.cache.has(reminder.server)) {
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
                    }else{
                        console.log("Not claiming reminder");
                    }
                }
            }else{
                bot.logger.log("Prevented duplicate reminder loading");
            }
        });
        if(bot.client.shard && bot.client.shard.ids.join(";") == 0) {
            process.on("message", async function handleClaimedReminders(message) {
                if (message.type === "handleClaimedReminders") {
                    console.log("processing unclaimed reminders");
                    if(bot.orphanedRemindersLoaded)return bot.logger.warn("Prevented duplicate orphaned reminder loading");
                    bot.orphanedRemindersLoaded = true;
                    const now = new Date().getTime();
                    let orphanedReminders = await bot.database.getOrphanedReminders(message.payload, bot.client.user.id);
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
        if(!module.exports.deletedReminders.includes(reminder.id)) {
            bot.logger.log(`Reminding ${reminder.id}: ${reminder.user}: ${reminder.message}`);
            try {
                if(!reminder.server)throw new Error("DM reminder");
                const channel = await bot.client.channels.fetch(reminder.channel);
                await channel.send(await bot.lang.getTranslation(channel.guild.id, "REMIND_REMINDER", {
                    username: reminder.user,
                    date: new Date(reminder.timestamp).toString(),
                    message: reminder.message
                }));
            } catch (e) {
                if(reminder.server) {
                    bot.logger.log("Reminder channel no longer exists, attempting to send it to the user instead...");
                }else{
                    bot.logger.log("DM Reminder, finding user...");
                }
                try {
                    const targetUser = await bot.client.users.fetch(reminder.user);
                    if (targetUser) {
                        const dm = await targetUser.createDM();
                        await dm.send(await bot.lang.getTranslation(reminder.channel, "REMIND_REMINDER", {
                            username: reminder.user,
                            date: new Date(reminder.timestamp).toString(),
                            message: reminder.message
                        }));
                    } else {
                        bot.logger.log("Couldn't retrieve the user.");
                    }
                } catch (e) {
                    bot.logger.error("Error whilst sending to user");
                    bot.raven.captureException(e);
                }
            }
        }else{
            bot.logger.log(`Reminder ${reminder.id} was deleted.`);
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
        await bot.util.standardNestedCommand(message, args, bot, "remind", module.exports, async function setReminder() {
            //Hacky hack hack
            message.content = message.content.replace(args[0], "in");
            console.log(message.content);
            const now = new Date();
            const rargs = regex.exec(message.content);
            const chronoParse = (chrono.parse(message.content, now, {forwardDate: true}))[0];
            let at = null;
            if (chronoParse && chronoParse.start)
                at = chronoParse.start.date();

            let reminder = null;
            if (!rargs || rargs.length < 3) {
                if (chronoParse && chronoParse.text) {
                    const guessedContent = message.content.substring(message.content.indexOf(chronoParse.text) + chronoParse.text.length);
                    if (guessedContent)
                        reminder = guessedContent;
                    else
                        return message.replyLang("REMIND_INVALID_MESSAGE");
                } else
                    return message.replyLang("REMIND_INVALID_MESSAGE");
            } else
                reminder = rargs[2];


            if (!at)
                return message.replyLang("REMIND_INVALID_TIME");

            if (at.getTime() >= 253370764800000)
                return message.replyLang("REMIND_LONG_TIME");

            if (at.getTime() >= 2147483647000)
                return message.channel.send(":stopwatch: You can't set a reminder for on or after 19th January 2038");

            const offset = at - now;

            if (offset < 0)
                return message.channel.send(":stopwatch: The time you entered is in the past. Try being more specific or using exact dates.");
            if (offset < 1000)
                return message.replyLang("REMIND_SHORT_TIME");

            if (reminder.length > 256)
                return message.channel.send("Your reminder message cannot be longer than 256 characters. Yours is " + reminder.length + " characters.");

            try {
                message.replyLang("REMIND_SUCCESS", {
                    time: bot.util.prettySeconds((offset / 1000) + 1, message.guild && message.guild.id, message.author.id),
                    date: at.toString()
                });
                if (message.getBool("remind.silentQueueTest")) {
                    bot.rabbit.channel.sendToQueue("newReminder", Buffer.from(JSON.stringify({
                        username: message.author.id,
                        server: message.guild ? message.guild.id : null,
                        channel: message.channel.id,
                        receiver: bot.client.user.id,
                        date: now.toString(),
                        message: reminder,
                        at: at.getTime(),
                    })));
                }
                if (message.getBool("remind.useQueue")) {
                    bot.rabbit.channel.sendToQueue("newReminder", Buffer.from(JSON.stringify({
                        username: message.author.id,
                        server: message.guild ? message.guild.id : null,
                        channel: message.channel.id,
                        receiver: bot.client.user.id,
                        date: now.toString(),
                        message: reminder,
                        at: at.getTime(),
                    })));
                } else {
                    const reminderResponse = await bot.database.addReminder(bot.client.user.id, message.author.id, message.guild ? message.guild.id : null, message.channel.id, at.getTime(), reminder);
                    bot.util.setLongTimeout(async function () {
                        try {
                            await message.replyLang("REMIND_REMINDER", {
                                username: message.author.id,
                                server: message.guild ? message.guild.id : null,
                                date: now.toString(),
                                message: reminder
                            });
                            await bot.database.removeReminder(reminderResponse[0])
                        } catch (e) {
                            bot.raven.captureException(e);
                        }
                    }, offset);
                }
            } catch (e) {
                console.log(e);
                message.replyLang("REMIND_ERROR");
                bot.raven.captureException(e);
            }
        });


    }
};