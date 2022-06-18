/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 07/09/2019
 * ╚════ ║   (ocelotbotv5) list
 *  ════╝
 */
const Util = require("../../util/Util");
const Strings = require("../../util/String");
module.exports = {
    name: "List Birthdays",
    usage: "list",
    commands: ["list", "view"],
    run: async function (context, bot) {
        let allBirthdays = await bot.database.getBirthdays(context.guild.id);
        if (allBirthdays.length === 0)
            return context.replyLang("BIRTHDAY_NONE", {command: context.command});

        const now = new Date();

        let header = await context.getLang(context.getSetting("birthday.channel") ? "BIRTHDAY_CHANNEL" : "BIRTHDAY_CHANNEL_NAG", {channel: context.getSetting("birthday.channel"), arg: context.command});

        header += "\n";

        allBirthdays = allBirthdays.map((birthday) => {
            let d = birthday.birthday; //Yes
            d.setYear(now.getFullYear());
            if (d <= now)
                d.setYear(now.getFullYear() + 1);

            birthday.days = Math.ceil((d - now) / 8.64e+7);
            if (birthday.days === 365) birthday.days = 0;
            return birthday;
        }).sort((a, b) => a.days - b.days);

        let chunkedBirthdays = allBirthdays.chunk(20);
        return Util.StandardPagination(bot, context, chunkedBirthdays, async function (birthdays, index) {
            let formatted = [];
            for (let i = 0; i < birthdays.length; i++) {
                const birthday = birthdays[i];
                const member = await context.guild.members.fetch(birthday.user).catch(()=>null);
                if (!member) continue;
                const user = member.user;
                if (user.username.startsWith("Deleted User ")) continue; //Fuck you discord
                let d = birthday.birthday; //Yes
                let days = birthday.days;
                if (days === 0)
                    days = context.getLang("BIRTHDAY_TODAY");
                else
                    days = context.getLang(days !== 1 ? "BIRTHDAY_DAYS" : "BIRTHDAY_DAY", {days});
                formatted.push({
                    user: `${user.username}#${user.discriminator}`.red,
                    birthday: await bot.lang.getTranslation(context.guild.id, "BIRTHDAY_DATE", {
                        day: bot.util.getNumberPrefix(d.getDate()),
                        month: bot.util.months[d.getMonth()]
                    }, context.user.id),
                    in: days
                });
            }

            return {content: header + Strings.Columnify(formatted)};
        });
    }
};