/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 23/03/2019
 * ╚════ ║   (ocelotbotv5) list
 *  ════╝
 */
const typeMap = {
    "boolean": "on or off",
}
const Embeds = require("../../util/Embeds");
const {MessageEditCommandContext} = require("../../util/CommandContext");
module.exports = {
    name: "View Settings",
    usage: "list :category?",
    commands: ["list", "view"],
    run: async function (context, bot, data) {
        if(context.options.category)
            context.options.category = context.options.category.toLowerCase();
        else
            context.options.category = "general";

        let assocs = await bot.redis.cache(`assoc-types`, async ()=>await bot.database.getSettingsAssocCommands(), 60000);

        let message;
        const components = [bot.util.actionRow(bot.interactions.addDropdown("Select Category...", assocs.map((cat) => ({
            label: context.getLang(`SETTINGS_CATEGORY_${cat.command.toUpperCase()}_LABEL`),
            description: context.getLang(`SETTINGS_CATEGORY_${cat.command.toUpperCase()}_DESC`),
            value: cat.command,
            default: context.options.category === cat.command,
        })), async (interaction) => {
            const categoryID = interaction.values[0];
            const newContext = Object.create(context);
            newContext.options = {command: "list", category: categoryID}
            if(message)message.delete();
            message = await bot.command.runCommand(newContext);
        }, 1, 1))]


        let settings = await (bot.database.getSettingsAssocForCommand(context.options.category));

        if(settings.length === 0)
            return message = await context.sendLang({content: "SETTINGS_NO_SETTINGS", components});

        let embed = new Embeds.AuthorEmbed(context);
        embed.setTitle("Available Settings");
        for(let i = 0; i < settings.length; i++) {
            const setting = settings[i];
            const value = context.getSetting(setting.setting);
            embed.addField(`${setting.name} ${value ? ` (Currently '${await parseValueType(context, setting.type, value)}')` : ""}`, `${setting.desc}\n\`${context.getSetting("prefix")}setting set ${setting.setting} ${typeMap[setting.type] || setting.type}\``);
        }

        message = await context.send({embeds: [embed], components});
    }
};


async function parseValueType(context, type, value){
    switch(type){
        case "boolean":
            return value === "1" || value === "true" ? "on" : "off";
        case "role":
            let role = await context.guild.roles.fetch(value).catch(()=>null);
            if(role?.name === "@everyone")return role.name;
            return role ? `@${role.name}` : `⚠️Invalid or deleted role!`;
        case "text_channel":
        case "voice_channel":
        case "category_channel":
        case "stage_channel":
        case "store_channel":
        case "news_channel":
        case "channel":
            let channel = await context.guild.channels.fetch(value).catch(()=>null);
            return channel ? `#${channel.name}` : `⚠️Invalid or deleted channel!`;
        default:
            return value;
    }
}