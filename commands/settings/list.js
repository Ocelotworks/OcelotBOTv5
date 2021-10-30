/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 23/03/2019
 * ╚════ ║   (ocelotbotv5) list
 *  ════╝
 */
const typeMap = {
    "boolean": "yes or no",
    "integer": "number",
}
const Embeds = require("../../util/Embeds");
module.exports = {
    name: "View Settings",
    usage: "list",
    commands: ["list", "view"],
    run: async function (context, bot, data) {
        let settings = await bot.database.getSettingsAssoc();
        let embed = new Embeds.AuthorEmbed(context);
        embed.setTitle("Available Settings");
        embed.setDescription("You can set specific values for certain OcelotBOT commands here.");
        for(let i = 0; i < settings.length; i++) {
            const setting = settings[i];
            const value = context.getSetting(setting.setting);
            embed.addField(`${setting.name} ${value ? ` (Currently '${value}')` : ""}`, `${setting.desc}\n\`${context.getSetting("prefix")}setting set ${setting.setting} ${typeMap[setting.type] || setting.type}\``);
        }
        return context.send({embeds: [embed]});
    }
};