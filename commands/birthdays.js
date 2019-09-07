/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 07/09/2019
 * ╚════ ║   (ocelotbotv5) birthdays
 *  ════╝
 */
module.exports = {
    name: "Birthdays List",
    usage: "birthday help/@user/add/list",
    detailedHelp: "List peoples birthdays and get reminders when it's their birthday ",
    categories: ["tools"],
    commands: ["birthdays", "birthday"],
    init: function init(bot){
        bot.util.standardNestedCommandInit("birthdays");
    },
    run: function(message, args, bot) {
        if (!message.guild) return message.replyLang("GENERIC_DM_CHANNEL");

        bot.util.standardNestedCommand(message, args, bot, "birthdays", null, async function () {
            if (message.mentions.users.size === 0)
                return message.channel.send(`To find a users birthday, you must @mention them. For more usage, type ${args[0]} help`);
            let target = message.mentions.users.first();
            let birthday = await bot.database.getBirthday(target.id, message.guild.id);
            if (!birthday)
                return message.channel.send(`That user doesn't have a birthday set up! If you know it, do ${args[0]} add`);
            const now = new Date();
            let d = birthday.birthday;
            if(d <= now)
                d.setYear(now.getYear()+1);
            message.channel.send(`${target}'s birthday is the **${bot.util.getNumberPrefix(d.getDate())} of ${bot.util.months[d.getMonth()]}**\n That's in ${bot.util.prettySeconds((d - now) / 1000)}`);
        });
    }
};