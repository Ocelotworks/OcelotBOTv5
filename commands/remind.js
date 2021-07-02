/**
 * Created by Peter on 01/07/2017.
 */
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
    }
};