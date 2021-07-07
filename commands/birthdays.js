/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 07/09/2019
 * ╚════ ║   (ocelotbotv5) birthdays
 *  ════╝
 */
module.exports = {
    name: "Birthdays List",
    usage: "birthday :@user?",
    detailedHelp: "List peoples birthdays and get reminders when it's their birthday ",
    usageExample: "birthday add @Big P 9th February",
    responseExample: "🎉 Birthday added!",
    categories: ["tools"],
    commands: ["birthdays", "birthday"],
    nestedDir: "birthdays",
    guildOnly: true,
    run: async function(context, bot) {
        if(!context.options.command)
            return bot.commands["nestedCommandHelp"](context, bot);
        if(!context.options.user)
            return context.sendLang({
                content: "BIRTHDAY_USAGE",
                ephemeral: true,
                components: [bot.util.actionRow(bot.interactions.suggestedCommand(context, "help"))]
            });
        const target = await context.channel.members.get(context.options.user);
        let birthday = await bot.database.getBirthday(target.id, context.guild.id);
        if (!birthday)
            return context.replyLang({content: "BIRTHDAY_NOT_FOUND", ephemeral: true}, {arg: context.command})
        const now = new Date();
        let d = birthday.birthday;
        d.setYear(now.getFullYear());
        if(d <= now)
            d.setYear(now.getFullYear()+1);

        return context.replyLang("BIRTHDAY", {
            target, day: bot.util.getNumberPrefix(d.getDate()),
            month: bot.util.months[d.getMonth()],
            time: bot.util.prettySeconds((d - now) / 1000, context.guild.id, context.user.id)
        })
    }
};