const Discord = require('discord.js');
const Embeds = require("../../util/Embeds");
module.exports = {
    name: "View Balance",
    usage: "balance :@user?",
    commands: ["balance", "bal"],
    run: async function (context, bot) {
        let target = context.user;
        if (context.options.user)
            target = (await context.getMember(context.options.user))?.user;
        if(!target)
            return context.sendLang({content: "GENERIC_USER_NOT_FOUND", ephemeral: true});
        let embed = new Embeds.LangEmbed(context);
        embed.setTitleLang("POINTS_BALANCE_TITLE");
        embed.setAuthor(target.username, target.avatarURL());
        embed.setDescriptionLang("POINTS_BALANCE_DESC", {balance: await bot.database.getPoints(target.id)})
        embed.addFieldLang("POINTS_BALANCE_WHAT_TITLE", "POINTS_BALANCE_WHAT_VALUE");
        embed.addFieldLang("POINTS_BALANCE_HOW_TITLE", "POINTS_BALANCE_HOW_VALUE");
        embed.setColor("#03F783");
        return context.send({
            embeds: [embed],
            components: [bot.util.actionRow(bot.interactions.suggestedCommand(context, "earn"), bot.interactions.suggestedCommand(context, "leaderboard"))]
        });
    }
};