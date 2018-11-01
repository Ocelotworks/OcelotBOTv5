/**
 * Created by Peter on 01/07/2017.
 */
const chrono = require('chrono-node');
const regex = new RegExp(".*?( .* )[\“\”\"\‘\’\'\‘\‚«»«»‹›「」『』﹃﹁﹄﹂《》〈〉](.*)[\“\”\"\‘\’\'\‘\‚«»«»‹›「」『』﹃﹁﹄﹂《》〈〉]");

module.exports = {
    name: "Reminders",
    usage: "remind <in> \"<message>\"",
    accessLevel: 0,
    commands: ["remind", "remindme", "reminder", "setreminder"],
    categories: ["tools"],
    init: function init(bot){
        bot.client.on("ready", async function(){
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
                    }
                }
            }else{
                bot.logger.log("Prevented duplicate reminder loading");
            }
        });
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
                    await targetUser.send(await bot.lang.getTranslation(reminder.channel, "REMIND_REMINDER", {
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
        const rargs = regex.exec(message.content);
        if(!rargs || rargs.length < 3){
            message.replyLang("REMIND_INVALID_MESSAGE");
            return;
        }

        const now = new Date();
        const at = chrono.parseDate(message.content, now);

        if(!at){
            message.replyLang("REMIND_INVALID_TIME");
            return;
        }

        if(at.getTime() >= 253370764800000){
            message.replyLang("REMIND_LONG_TIME");
            return;
        }

        const offset = at - now.getTime();


        if(offset < 1000){
            message.replyLang("REMIND_SHORT_TIME");
            return;
        }
        try {
            const reminderResponse = await bot.database.addReminder("discord", message.author.id, message.guild.id, message.channel.id, at.getTime(), rargs[2]);
            message.replyLang("REMIND_SUCCESS", {time: bot.util.prettySeconds(offset / 1000), date: at.toString()});
            bot.util.setLongTimeout(async function () {
                try {
                    message.replyLang("REMIND_REMINDER", {
                        username: message.author.id,
                        date: now.toString(),
                        message: rargs[2]
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