const {NotificationContext} = require("../../util/CommandContext");
module.exports = {
    name: "Set Birthday Channel",
    usage: "channel [clear?:clear] :#name?",
    commands: ["setchannel", "channel"],
    userPermissions: ["MANAGE_CHANNELS"],
    argDescriptions: {
        clear: {name: "Stop receiving birthday reminders"},
        name: {name: "The channel name to receive reminders in"},
    },
    init: async function init(bot) {
        bot.client.once("ready", () => {
            const now = new Date();
            let date = new Date();
            if (date.getHours() >= 10) {
                date.setDate(date.getDate() + 1);
            }
            date.setHours(10, 0, 0, 0);
            let initialTimer = date - now;
            bot.logger.log(`Sending birthday messages in ${initialTimer}ms`);
            setTimeout(processChannels, initialTimer, bot);
        });
    },
    run: async function (context, bot) {
        let target = context.channel.id;
        if (context.options.name > 0)
            target = context.options.name;

        if (context.options.clear) {
            await bot.config.set(context.guild.id, "birthday.channel", null);
            return context.replyLang("BIRTHDAY_CHANNEL_DISABLED");
        }

        const channel = await context.guild.channels.fetch(target)
        if(!channel.isText())
            return context.reply({ephemeral: true, content: "Only text channels can be used for birthday announcements"});

        await bot.config.set(context.guild.id, "birthday.channel", target);
        return context.replyLang("BIRTHDAY_CHANNEL_SET", {target, command: context.command, arg: context.options.command})
    }
};


async function processChannels(bot) {
    if (bot.drain) return;
    setTimeout(processChannels, 8.64e7, bot);
    let birthdays = await bot.database.getBirthdaysTodayForShard([...bot.client.guilds.cache.keys()]);
    bot.logger.log(`Got ${birthdays.length} birthdays today.`);
    const nowYear = new Date().getFullYear();
    for (let i = 0; i < birthdays.length; i++) {
        const birthday = birthdays[i];
        try {
            let birthdayChannelId = bot.config.get(birthday.server, "birthday.channel", birthday.user);
            if (!birthdayChannelId) continue;
            let birthdayChannel = await bot.client.channels.fetch(birthdayChannelId);
            const member = await birthdayChannel.guild.members.fetch(birthday.user).catch(()=>null);
            if(!member){
                bot.logger.warn(`Didn't print birthday for ${birthday.user} in ${birthday.server} because they are no longer in the server.`);
                continue;
            }
            const context = new NotificationContext(bot, birthdayChannel, member.user, member);
            const age = nowYear - new Date(birthday.birthday).getFullYear();
            context.sendLang(age > 13 ? "BIRTHDAY_MESSAGE_AGE" : "BIRTHDAY_MESSAGE", {user: birthday.user, age: bot.util.getNumberPrefix(age)})
        } catch (e) {
            await bot.config.set(birthday.server, "birthday.channel", null);
            bot.raven.captureException(e);
            console.error(e);
        }
    }
}