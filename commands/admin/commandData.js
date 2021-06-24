/**
 *  ╔════     Copyright 2018 Peter Maguire
 *  ║ ════╗   Created 04/12/2018
 *  ╚════ ║   (ocelotbotv5) ban
 *    ════╝
 */
const Discord = require('discord.js');
module.exports = {
    name: "Command Data",
    usage: "command :commanddata :subcommand?",
    commands: ["commanddata", "cd"],
    run: async function (context, bot) {
        const data = bot.commandUsages[context.options.commanddata];
        if (!data)
            return context.send("No such command exists");

        let embed = new Discord.MessageEmbed();
        embed.setTitle(`Data for '${data.name}'`);
        let desc = `Usage: \`${data.usage}\``;

        if (data.guildOnly)
            desc += "\n- Guild Only";

        if (data.adminOnly)
            desc += "\n- Admin Only";

        if (data.premium)
            desc += "\n- Premium Only";

        if (data.vote)
            desc += "\n- Requires Vote";

        if (data.unwholesome)
            desc += "\n- Unwholesome";

        if (data.hidden)
            desc += "\n- Hidden";

        if (data.slashHidden)
            desc += "\n- Hidden for Slash Commands";

        if (data.noSynthetic)
            desc += "\n- Disabled for Custom Commands";

        embed.setDescription(desc);

        embed.addField("Aliases", data.commands.join(", "), true);
        embed.addField("Categories", data.categories.join(", "), true)
        if(data.detailedHelp)
            embed.addField("Detailed Help", data.detailedHelp, true);

        if (data.usageExample)
            embed.addField("Usage Example", data.usageExample, true);

        if (data.responseExample)
            embed.addField("Response Example", data.responseExample, true);

        if (data.rateLimit) {
            const max = context.getSetting("rateLimit");
            embed.addField("RateLimit", `${data.rateLimit}/${max} (${(max/data.rateLimit).toFixed(0)} per minute)`, true);
        }

        if (data.nestedDir)
            embed.addField("Sub-command directory", data.nestedDir, true);

        if (data.userPermissions)
            embed.addField("Requires User Permissions", data.userPermissions.join(", "), true);

        if (data.requiredPermissions)
            embed.addField("Requires Bot Permissions", data.requiredPermissions.join(", "), true);

        if (data.subCommands)
            embed.addField("Sub-commands", Object.keys(data.subCommands).join(", "))

        if(data.pattern)
            embed.addField("Parsed Pattern", `\`\`\`json\n${JSON.stringify(data.pattern)}\n\`\`\``);

        if(context.options.subcommand && data.subCommands[context.options.subcommand])
            embed.addField("Sub-command Pattern", `\`\`\`json\n${JSON.stringify(data.subCommands[context.options.subCommand].pattern)}\n\`\`\``);

        return context.send({embeds: [embed]});
    }
};