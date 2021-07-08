const Discord = require('discord.js');
const Embeds = require("../../util/Embeds");
module.exports = {
    name: "View Custom Function",
    usage: "view :0id? :name?+",
    commands: ["view", "get"],
    run: async function (context, bot) {
        const func = await context.commandData.getNameOrId(context, bot);
        if(!func)return;
        const embed = new Embeds.LangEmbed(context);
        embed.setTitleLang("CUSTOM_VIEW_TITLE", func);
        embed.setDescriptionLang("CUSTOM_VIEW_DESCRIPTION", func);
        embed.addField("Type", func.type, true);
        embed.addField("Trigger", func.trigger, true);
        if(func.function.length < 900) {
            embed.addField("Code", `\`\`\`lua\n${func.function}\n\`\`\``);
            return context.send({embeds: [embed]});
        } else {
            // TODO: this won't work as an interaction
            return context.send({embeds: [embed], files: [new Discord.MessageAttachment(Buffer.from(func.function), "code.lua")]});
        }
    }
}