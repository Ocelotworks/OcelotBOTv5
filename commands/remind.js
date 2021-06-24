/**
 * Created by Peter on 01/07/2017.
 */
const chrono = require('chrono-node');
const regex = new RegExp(".*?( .* )[\“\”\"\‘\’\'\‚«»‹›「」『』﹃﹁﹄﹂《》〈〉](.*)[\“\”\"\‘\’\'\‚«»‹›「」『』﹃﹁﹄﹂《》〈〉]");

module.exports = {
    name: "Reminders",
    usage: "remind :command? :args?+",
    accessLevel: 0,
    detailedHelp: "Set one-time reminders or set recurring reminders",
    usageExample: "remind in 5 minutes 'fix reminders'",
    responseExample: "⏱ Reminding you in **5 minutes**",
    commands: ["remind", "remindme", "reminder", "setreminder", "reminders"],
    categories: ["tools"],
    // This doesn't feel right
    deletedReminders: [],
    recurringReminders: {},
    nestedDir: "remind",
    init: function init(bot){
        // bot.client.on("ready", function () {
        //     bot.rabbit.channel.assertQueue(`reminder-${bot.client.user.id}-${bot.util.shard}`, {exclusive: true});
        //     bot.rabbit.channel.consume(`reminder-${bot.client.user.id}-${bot.util.shard}`, function reminderConsumer(message) {
        //         try {
        //             let reminder = JSON.parse(input);
        //             if (bot.config.getBool("global", "remind.silentQueueTest")) {
        //                 bot.logger.warn("Silent test: got reminder from reminder worker");
        //                 bot.logger.log(reminder);
        //             } else {
        //                 module.exports.sendReminder(reminder, bot);
        //             }
        //             bot.rabbit.channel.ack(message);
        //         } catch (e) {
        //             bot.raven.captureException(e);
        //             bot.logger.error(e);
        //         }
        //     });
        // });


        bot.client.once("ready", async function discordReady(){
            bot.logger.log("Loading reminders...");
            const reminderResult = await bot.database.getReminders(bot.client.user.id);
            const now = new Date().getTime();
            let claimed = [];
            for (let i = 0; i < reminderResult.length; i++) {
                const reminder = reminderResult[i];
                if ((reminder.server && bot.client.guilds.cache.has(reminder.server)) || (!reminder.server && bot.util.shard == 0)) {
                    bot.logger.log(`Reminder ${reminder.id} belongs to this shard.`);
                    const remainingTime = reminder.at - now;
                    if (remainingTime <= 0) {
                        bot.logger.log(`Reminder ${reminder.id} has expired.`);

                        await module.exports.sendReminder(reminder, bot);
                    } else {
                        bot.util.setLongTimeout(function () {
                            module.exports.sendReminder(reminder, bot);
                        }, remainingTime);
                    }
                    claimed.push(reminder.id);
                }
            }
            bot.rabbit.event({type: "claimReminder", payload: claimed});
        });
        if(bot.util.shard == 0) {

            let totalClaims = 0;
            let claimedReminders = [];
            bot.bus.on('claimReminder', async (msg)=>{
                return;
                totalClaims++;
                claimedReminders.push(...msg.payload)
                if(totalClaims == process.env.SHARD_COUNT){
                    const now = new Date().getTime();
                    let orphanedReminders = await bot.database.getOrphanedReminders(claimedReminders, bot.client.user.id);
                    bot.logger.log(`Found ${orphanedReminders.length} orphaned reminders.`);
                    for(let i = 0; i < orphanedReminders.length; i++){
                        let reminder = orphanedReminders[i];
                        bot.logger.log(`Reminder ${orphanedReminders[i].id} is orphaned.`);
                        const remainingTime = reminder.at - now;
                        if (remainingTime <= 0) {
                            bot.logger.log(`Reminder ${reminder.id} has expired.`);

                            await module.exports.sendReminder(reminder, bot);
                        } else {
                            bot.util.setLongTimeout(function () {
                                module.exports.sendReminder(reminder, bot);
                            }, remainingTime);
                        }
                    }
                }else if(totalClaims > process.env.SHARD_COUNT){
                    bot.logger.warn(`Warning! Extra claims, ${totalClaims} claims sent but only ${process.env.SHARD_COUNT} shards should exist!`);
                }
            })

        }
    },
    sendReminder: async function(reminder, bot){
        if(bot.drain)return;
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
    run: async function(context, bot){
        //Hacky hack hack
        let input = `in ${context.options.command} ${context.options.args}`;
        const now = new Date();
        const rargs = regex.exec(input);
        const chronoParse = (chrono.parse(input, now, {forwardDate: true}))[0];
        let at = null;
        if (chronoParse && chronoParse.start)
            at = chronoParse.start.date();


        let reminder = null;
        if (!rargs || rargs.length < 3) {
            if (chronoParse && chronoParse.text) {
                const guessedContent = input.substring(input.indexOf(chronoParse.text) + chronoParse.text.length);
                if (guessedContent)
                    reminder = guessedContent;
                else
                    return context.sendLang("REMIND_INVALID_MESSAGE");
            } else
                return context.sendLang("REMIND_INVALID_MESSAGE");
        } else
            reminder = rargs[2];


        if (!at)
            return context.sendLang("REMIND_INVALID_TIME");

        if (at.getTime() >= 253370764800000)
            return context.sendLang("REMIND_LONG_TIME");

        if (at.getTime() >= 2147483647000)
            return context.send(":stopwatch: You can't set a reminder for on or after 19th January 2038");

        const offset = at - now;

        if (offset < 0)
            return context.send(":stopwatch: The time you entered is in the past. Try being more specific or using exact dates.");
        if (offset < 1000)
            return context.sendLang("REMIND_SHORT_TIME");

        if (reminder.length > 1000)
            return context.send("Your reminder message cannot be longer than 1000 characters. Yours is " + reminder.length + " characters.");

        try {
            context.sendLang("REMIND_SUCCESS", {
                time: bot.util.prettySeconds((offset / 1000), context.guild && context.guild.id, context.user.id),
                date: at.toString()
            });
            const reminderResponse = await bot.database.addReminder(bot.client.user.id, context.user.id, context.guild ? context.guild.id : null, context.channel.id, at.getTime(), reminder, context.message?.id);
            bot.util.setLongTimeout(async function () {
                try {
                    await context.sendLang("REMIND_REMINDER", {
                        username: context.user.id,
                        server: context.guild ? context.guild.id : null,
                        date: now.toString(),
                        message: reminder
                    });
                    await bot.database.removeReminder(reminderResponse[0])
                } catch (e) {
                    bot.raven.captureException(e);
                }
            }, offset);
        } catch (e) {
            console.log(e);
            context.sendLang("REMIND_ERROR");
            bot.raven.captureException(e);
        }

    }
};