/**
 * Created by Peter on 07/06/2017.
 */
const Embeds = require("../util/Embeds");
const Icon = require("../util/Icon");
const alphaRegex = /[a-z]/g;
module.exports = {
    name: "Help Command",
    usage: "help :command?",
    detailedHelp: "Get a list of commands here.",
    usageExample: "help",
    commands: ["help", "commands"],
    categories: ["meta"],
    init: function init(bot) {
        bot.bus.on("commandLoadFinished", function commandLoadFinished() {
            bot.logger.log("Generating help categories");
            bot.commandCategories = {};
            for (let i in bot.commandUsages) {
                const commandUsage = bot.commandUsages[i];
                for (let j = 0; j < commandUsage.categories.length; j++) {
                    const category = commandUsage.categories[j];
                    if (bot.commandCategories[category] && !bot.commandCategories[category][commandUsage.id]) {
                        bot.commandCategories[category][commandUsage.id] = commandUsage;
                    } else if (!bot.commandCategories[category]) {
                        bot.commandCategories[category] = {[commandUsage.id]: commandUsage};
                    }
                }
            }
        });
    },
    run: async function run(context, bot) {
        if (!context.options.command) {
            if(!context.guild || context.channel.permissionsFor(bot.client.user.id).has("EMBED_LINKS")) {
                const embed = new Embeds.AuthorEmbed(context);
                embed.setTitle("OcelotBOT Help");
                embed.setDescription(`Here is a list of command categories. Type **${context.command}** followed by a category or a command name to learn more.\nAlternatively, you can view an interactive command list [here](https://ocelotbot.xyz/commands).`);
                for (let i in bot.commandCategories) {
                    if(!bot.commandCategories.hasOwnProperty(i))continue;
                    if ((context.getSetting("help.hiddenCategories") && context.getSetting("help.hiddenCategories").indexOf(i) > -1) || (i === "nsfw" && (context.getBool("allowNSFW") || context.getBool("wholesome"))))
                        continue;
                    embed.addField(i[0].toUpperCase() + i.substring(1), `Type \`${context.getSetting("prefix")}${context.command} ${i}\``, true);
                }
                embed.addField("Custom", `Type \`${context.command} custom\``, true);
                return context.send({embeds: [embed], ephemeral: true});
            }
            let output = "OcelotBOT Help:\n```python\n"
            for (let i in bot.commandCategories) {
                if(!bot.commandCategories.hasOwnProperty(i))continue;
                if ((context.getSetting("help.hiddenCategories") && context.getSetting("help.hiddenCategories").indexOf(i) > -1) || (i === "nsfw" && (context.getBool("allowNSFW") || context.getBool("wholesome"))))
                    continue;
                output += `For ${i[0].toUpperCase() + i.substring(1)}: type ${context.getSetting("prefix")}${context.command} ${i}\n`
            }
            output += "```";
            return context.send({content: output, ephemeral: true});
        }
        if(context.options.command === "custom" && context.guild){
            if(bot.customFunctions.COMMAND[context.guild.id]) {
                let output = "```cs\n# Custom Commands\n";
                const customCommands = Object.keys(bot.customFunctions.COMMAND[context.guild.id]);
                for (let i = 0; i < customCommands.length; i++) {
                    output += `${context.getSetting("prefix")}${customCommands[i]}\n`;
                }
                output += `\`\`\`\nTo view custom commands help, type **${context.getSetting("prefix")}custom**`;
                return context.send({content: output, ephemeral: true});
            }
            return context.send({content: `:warning: This server does not have any Custom Commands setup! To learn more, type **${context.getSetting("prefix")}custom**`, ephemeral: true});
        }
        if (!bot.commandCategories[context.options.command]) {
            if (!bot.commandUsages[context.options.command]) {
                return context.sendLang({
                    content: "COMMANDS_INVALID_CATEGORY",
                    ephemeral: true
                }, {arg: context.command});
            }
            let command = bot.commandUsages[context.options.command];
            let output = `**${command.name} Help:**\n`;
            if (command.detailedHelp)
                output += command.detailedHelp + "\n";
            if (command.commands.length > 1)
                output += `**Aliases:** ${command.commands.join(", ")}\n`;
            if (context.getBool(`${context.options.command}.disable`))
                output += "🚫 This command is **disabled**. You cannot run it here (or maybe anywhere)\n";
            if (context.getSetting(`${context.options.command}.override`))
                output += "❓ This command is **overridden**. This usually means it's temporarily disabled.\n";
            if (context.getSetting(`${context.options.command}.channelDisable`))
                output += "🚫 This command is **disabled in the following channels**: <#" + context.getSetting(`${context.options.command}.channelDisable`).replace(/,/g, "> <#") + "> \n"; //Genius
            if (context.getSetting(`${context.options.command}.channelRestriction`))
                output += "🚫 This command is **restricted to the following channels**: <#" + context.getSetting(`${context.options.command}.channelRestriction`).replace(/,/g, "> <#") + "> \n"; //Genius
            if (command.hidden)
                output += ":eyes: This command is **hidden**. How did you find it?\n";
            if (command.premium)
                output += `${Icon.premium} This command requires **OcelotBOT Premium**\n`;
            if (command.vote) {
                if (context.getSetting("restrictionType") === "vote") {
                    output += `${Icon.supporter_1} This command requires you to **vote for OcelotBOT** every 24 hours.\n`;
                } else {
                    output += `${Icon.supporter_1} This command requires you to **join the Support Server**.\n`;
                }
            }
            if (command.categories.indexOf("nsfw") > -1)
                output += "🔞 This command is **Not Safe For Work**\n";
            if (command.unwholesome)
                output += "⭐ This command can't be used in **Wholesome Mode**\n";
            if (command.adminOnly)
                output += `${Icon.ocelotbot} This command is for **Admins Only**\n`;
            if (command.guildOnly)
                output += `🚫 This command **cannot be used in a DM Channel**\n`;
            if (command.noSynthetic)
                output += `🚫 This command **cannot be used inside a custom command**\n`;
            if (command.settingsOnly)
                output += `🔒 This command **can only be used by people with the configured settings role**\n`;

            output += `**Usage:** ${context.getSetting("prefix")}${command.usage}\n`;
            if (command.usageExample)
                output += `**Example:** ${context.getSetting("prefix")}${command.usageExample}\n`;

            return context.send({content: output, ephemeral: true});
        }
        let unique = []; //ahhh..
        let output = "";
        if (context.options.command === "nsfw" && !context.channel.nsfw)
            output += "# NSFW Commands can only be used in NSFW channels.\n";
        const prefix = context.getSetting("prefix");
        let commandUsages = bot.commandUsages;
        if (context.options.command && bot.commandCategories[context.options.command]) {
            commandUsages = bot.commandCategories[context.options.command];
        }
        for (let i in commandUsages) {
            if (commandUsages.hasOwnProperty(i) && !commandUsages[i].hidden && !context.getBool(`${i}.disable`) && !(commandUsages[i].unwholesome && context.getBool("wholesome")) && !(commandUsages[i].nsfw && context.getBool("allowNSFW")))
                if (unique.indexOf(commandUsages[i].name) === -1) {
                    unique.push(commandUsages[i].name);
                    let usage = commandUsages[i].usage;
                    if (prefix[prefix.length - 1].match(alphaRegex))
                        usage[0] = usage[0].toUpperCase();
                    output += `${commandUsages[i].name}:: ${prefix}${commandUsages[i].usage}\n`
                }
        }
        return context.sendLang("COMMANDS", {commands: output});
    }
};