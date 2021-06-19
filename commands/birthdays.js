/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 07/09/2019
 * ╚════ ║   (ocelotbotv5) birthdays
 *  ════╝
 */
module.exports = {
    name: "Birthdays List",
    usage: "birthday",
    detailedHelp: "List peoples birthdays and get reminders when it's their birthday ",
    usageExample: "birthday add @Big P 9th February",
    responseExample: "🎉 Birthday added!",
    categories: ["tools"],
    commands: ["birthdays", "birthday"],
    init: function init(bot){
        bot.util.standardNestedCommandInit("birthdays");
    },
    run: async function(message, args, bot) {
        if (!message.guild) return message.replyLang("GENERIC_DM_CHANNEL");

        await bot.util.standardNestedCommand(message, args, bot, "birthdays", null, async function () {
            if (message.mentions.users.size === 0)
                return message.replyLang("BIRTHDAY_USAGE", {arg: args[0]});
            let target = message.mentions.users.first();
            let birthday = await bot.database.getBirthday(target.id, message.guild.id);
            if (!birthday)
                return message.replyLang("BIRTHDAY_NOT_FOUND", {arg: args[0]})
            const now = new Date();
            let d = birthday.birthday;
            d.setYear(now.getFullYear());
            if(d <= now)
                d.setYear(now.getFullYear()+1);

            message.replyLang("BIRTHDAY", {
                target, day: bot.util.getNumberPrefix(d.getDate()),
                month: bot.util.months[d.getMonth()],
                time: bot.util.prettySeconds((d - now) / 1000, message.guild.id, message.author.id)
            })
        });
    }
};