module.exports = {
    name: "Set Birthday Channel",
    usage: "channel #name/clear",
    commands: ["setchannel", "channel"],
    init: async function init(bot) {
        bot.client.once("ready", () => {
            const now = new Date();
            let date = new Date();
            if (date.getHours() >= 11) {
                date.setDate(date.getDate() + 1);
            }
            date.setHours(11, 0, 0, 0);
            let initialTimer = date - now;
            bot.logger.log(`Sending birthday messages in ${initialTimer}ms`);
            setTimeout(processChannels, initialTimer, bot);
        });
    },
    run: async function (message, args, bot) {
        if (!message.member.hasPermission("MANAGE_CHANNELS")) return message.channel.send("You must have the Manage Channels permission to use this command.");
        let target = message.channel.id;
        if (message.mentions.channels.size > 0)
            target = message.mentions.channels.first().id;

        if (args[2] && args[2].toLowerCase() === "clear") {
            await bot.config.set(message.guild.id, "birthday.channel", null);
            message.replyLang("BIRTHDAY_CHANNEL_DISABLED");
            message.channel.send("The Birthdays channel has been disabled.");
        } else {
            await bot.config.set(message.guild.id, "birthday.channel", target);
            message.replyLang("BIRTHDAY_CHANNEL_SET", {target, command: args[0], arg: args[1]})
        }
    }
};


async function processChannels(bot) {
    if (bot.drain) return;
    setTimeout(processChannels, 8.64e7, bot);
    let birthdays = await bot.database.getBirthdaysTodayForShard(bot.client.guilds.cache.keyArray());
    bot.logger.log(`Got ${birthdays.length} birthdays today.`);
    const nowYear = new Date().getFullYear();
    for (let i = 0; i < birthdays.length; i++) {
        const birthday = birthdays[i];
        try {
            let birthdayChannelId = bot.config.get(birthday.server, "birthday.channel", birthday.user);
            if (!birthdayChannelId) continue;
            let birthdayChannel = await bot.client.channels.fetch(birthdayChannelId);
            const age = nowYear - new Date(birthday.birthday).getFullYear();
            if (age > 13) {
                birthdayChannel.sendLang("BIRTHDAY_MESSAGE_AGE", {user: birthday.user, age: bot.util.getNumberPrefix(age)})
            } else {
                birthdayChannel.sendLang("BIRTHDAY_MESSAGE", {user: birthday.user})
            }
        } catch (e) {
            await bot.config.set(birthday.server, "birthday.channel", null);
            bot.raven.captureException(e);
            console.error(e);
        }
    }
}