const Embeds = require("../../util/Embeds");
const end = new Date("1 November 2021");
const start = new Date("1 October 2021");
module.exports = {
    name: "Introduction",
    usage: "intro",
    commands: ["intro", "introduction", "info"],
    run: async function (context, bot) {
        const embed = new Embeds.LangEmbed(context);
        embed.setColor("#bf621a");
        embed.setTitleLang("SPOOK_INTRO_TITLE", {series: start.getFullYear()});
        embed.setDescriptionLang("SPOOK_INTRO_DESC", {start, end});
        embed.addFieldLang("SPOOK_INTRO_SLASHCOMMANDS_TITLE", "SPOOK_INTRO_SLASHCOMMANDS_VALUE");
        embed.addFieldLang("SPOOK_INTRO_SPECIAL_ROLES_TITLE", "SPOOK_INTRO_SPECIAL_ROLES_VALUE");
        embed.addFieldLang("SPOOK_INTRO_REWARDS_TITLE", "SPOOK_INTRO_REWARDS_VALUE");
        embed.addFieldLang("SPOOK_INTRO_OPT_OUT_TITLE", "SPOOK_INTRO_OPT_OUT_VALUE");
        embed.addFieldLang("SPOOK_INTRO_ADMINS_TITLE",
            context.getSetting("settings.role") ? "SPOOK_INTRO_ADMINS_VALUE_ROLE": "SPOOK_INTRO_ADMINS_VALUE_ROLE", false, {role: context.getSetting("settings.role")});
        await context.send({embeds: [embed]});
    }
}
