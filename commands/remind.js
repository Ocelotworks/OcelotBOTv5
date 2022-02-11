/**
 * Created by Peter on 01/07/2017.
 */
const Discord = require('discord.js');
const chrono = require("chrono-node");
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
    contextMenu: {
        type: "message",
        value: "message",
        func: true,
    },
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
    buildEmbed(reminder){
        const embed = new Discord.MessageEmbed();
        embed.setColor("#6868f5")
        embed.setTitle(":stopwatch: Reminder");
        embed.setDescription(`<t:${Math.floor(reminder.timestamp/1000)}:R> you told me to remind you of this:\n>>> \n${reminder.message}\n\u200B`);
        embed.setTimestamp(reminder.at);
        return embed;
    },
    sendReminder: async function (reminder, bot) {
        if (bot.drain) return;
        if (!module.exports.deletedReminders.includes(reminder.id)) {
            bot.logger.log(`Reminding ${reminder.id}: ${reminder.user}: ${reminder.message}`);
            try {
                if (!reminder.server) throw new Error("DM reminder");
                const channel = await bot.client.channels.fetch(reminder.channel);
                let embed = module.exports.buildEmbed(reminder);
                try {
                    await channel.send({
                        content: `<@${reminder.user}>`,
                        embeds: [module.exports.buildEmbed(reminder)],
                        reply: {messageReference: reminder.messageID},
                    });
                }catch(e){
                    await channel.send({
                        content: `<@${reminder.user}>`,
                        embeds: [module.exports.buildEmbed(reminder)],
                    });
                }
                if(!channel.members.has(reminder.user)){
                    embed.addField(":warning: Note", "You are receiving this reminder because you are no longer in the channel in which the reminder was set.");
                    const targetUser = await bot.client.users.fetch(reminder.user);
                    const dm = await targetUser.createDM();
                    await dm.send({embeds: [embed]});
                }
            } catch (e) {
                try{
                    bot.logger.log("Reminder channel no longer exists or is DM, attempting to send it to the user instead...");
                    const targetUser = await bot.client.users.fetch(reminder.user);
                    if (targetUser) {
                        const dm = await targetUser.createDM();
                        let embed = module.exports.buildEmbed(reminder);
                        if(reminder.server)
                            embed.addField(":warning: Note", `This reminder was supposed to go to <#${reminder.channel}>, but I couldn't access it. It could be deleted, or I could have been kicked from that server.`);
                        await dm.send({content: `<@${reminder.user}>`, embeds: [module.exports.buildEmbed(reminder)]});
                    } else {
                        bot.logger.log("Couldn't retrieve the user.");
                    }
                } catch (e) {
                    bot.logger.error("Error whilst sending to user");
                    bot.raven.captureException(e);
                }
            }
        } else {
            bot.logger.log(`Reminder ${reminder.id} was deleted.`);
        }
        try {
            if(!reminder.id)return bot.logger.warn("Reminder had no ID");
            await bot.database.removeReminder(reminder.id);
            bot.logger.log(`Removed reminder ${reminder.id}`);
        } catch (err) {
            bot.logger.error(`Error removing reminder!!! This is bad!!! ${err.stack}`);
            bot.raven.captureException(err);
        }
    },
    async runContextMenu(context, bot){
        let form = await bot.interactions.awaitForm(context, {
            "title": "Set Reminder",
            "components": [{
                "type": 1,
                "components": [{
                    "type": 4,
                    "custom_id": "time",
                    "label": "When should I remind you?",
                    "style": 1,
                    "min_length": 1,
                    "max_length": 2000,
                    "placeholder": "in 2 hours",
                    "value": "in 2 hours",
                    "required": true
                }]
            }]}, 60000);
        const now = new Date();
        const chronoParse = (chrono.parse(form.time, now, {forwardDate: true}))[0];

        let at = chronoParse?.start?.date();

        if(!at)
            return context.sendLang({ephemeral: true, content: "REMIND_INVALID_TIME"});

        if (at.getTime() >= 2147483647000)
            return context.send({ephemeral: true, content: ":stopwatch: You can't set a reminder for on or after 19th January 2038"});

        const offset = at - now;

        if (offset < 0)
            return context.send({ephemeral: true, content: ":stopwatch: The time you entered is in the past. Try being more specific or using exact dates."});
        if (offset < 1000)
            return context.sendLang({ephemeral: true, content: "REMIND_SHORT_TIME"});

        const reminder = `[Message in ${context.guild?.name || "this channel"}](https://discord.com/channels/${context.guild?.id || "@me"}/${context.channel.id}/${context.options.message})`;

        const reminderResponse = await bot.database.addReminder(bot.client.user.id, context.user.id, null, context.channel.id, at.getTime(), reminder, context.message?.id);
        context.sendLang({ephemeral: true, content: "REMIND_MESSAGE_SUCCESS"}, {
            time: bot.util.prettySeconds((offset / 1000), context.guild && context.guild.id, context.user.id),
            date: `<t:${Math.floor(at.getTime()/1000)}:F>`,
            id: reminderResponse[0],
        });
        bot.util.setLongTimeout(async function () {
            return context.commandData.sendReminder({
                messageID: context.message?.id,
                receiver: bot.client.user.id,
                channel: context.channel.id,
                server: null,
                id: reminderResponse[0],
                user: context.user.id,
                timestamp: now,
                message: reminder,
                at: at,
            }, bot);
        }, offset);
    }
};