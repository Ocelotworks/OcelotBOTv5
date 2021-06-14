/**
 * Created by Peter on 07/06/2017.
 */
const Discord = require('discord.js');
const alphaRegex = /[a-z]/g;
module.exports = {
    name: "Help Command",
    usage: "help [command]",
    detailedHelp: "Get a list of commands here.",
    usageExample: "help",
    commands: ["help", "commands"],
    requiredPermissions: ["EMBED_LINKS"],
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
    showHelpFor: function (list, message) {
        let output = "";
        for (let i in list) {
            if (list.hasOwnProperty(i) && !list[i].hidden)
                output += `${list[i].name}:: ${message.getSetting("prefix")}${list[i].usage}\n`
        }
        message.editLang("COMMANDS", output);
    },
    run: async function run(message, args, bot) {
        if (!args[1]) {
            const embed = new Discord.MessageEmbed();
            embed.setColor("#03F783");
            embed.setTitle("OcelotBOT Help");
            embed.setDescription(`Here is a list of command categories. Type **${args[0]}** followed by a category or a command name to learn more.\nAlternatively, you can view an interactive command list [here](https://ocelotbot.xyz/commands).`);
            for (let i in bot.commandCategories) {
                if ((message.getSetting("help.hiddenCategories") && message.getSetting("help.hiddenCategories").indexOf(i) > -1) || (i === "nsfw" && (message.getBool("allowNSFW") || message.getBool("wholesome"))))
                    continue;
                embed.addField(i[0].toUpperCase()+i.substring(1), `Type \`${args[0]} ${i}\``, true);
            }
            embed.addField("Custom", `Type \`${args[0]} custom\``, true);
            return message.channel.send({embeds: [embed]});
        }
        const arg = args[1].toLowerCase();
        if(arg === "custom" && message.guild){
            if(bot.customFunctions.COMMAND[message.guild.id]) {
                let output = "```cs\n# Custom Commands\n";
                const customCommands = Object.keys(bot.customFunctions.COMMAND[message.guild.id]);
                for (let i = 0; i < customCommands.length; i++) {
                    output += `${message.getSetting("prefix")}${customCommands[i]}\n`;
                }
                output += `\`\`\`\nTo view custom commands help, type **${message.getSetting("prefix")}custom**`;
                return message.channel.send(output);
            }else{
                return message.channel.send(`:warning: This server does not have any Custom Commands setup! To learn more, type **${message.getSetting("prefix")}custom**`);
            }
        }else if (!bot.commandCategories[arg]) {
            if (bot.commandUsages[arg]) {
                let command = bot.commandUsages[arg];
                let output = `**${command.name} Help:**\n`;
                if (command.detailedHelp)
                    output += command.detailedHelp + "\n";
                if (command.commands.length > 1)
                    output += `**Aliases:** ${command.commands.join(", ")}\n`;
                if (message.getBool(`${arg}.disable`))
                    output += "🚫 This command is **disabled**. You cannot run it here (or maybe anywhere)\n";
                if (message.getSetting(`${arg}.override`))
                    output += "❓ This command is **overridden**. This usually means it's temporarily disabled.\n";
                if (message.getSetting(`${arg}.channelDisable`))
                    output += "🚫 This command is **disabled in the following channels**: <#" + message.getSetting(`${arg}.channelDisable`).replace(/,/g, "> <#") + "> \n"; //Genius
                if (message.getSetting(`${arg}.channelRestriction`))
                    output += "🚫 This command is **restricted to the following channels**: <#" + message.getSetting(`${arg}.channelRestriction`).replace(/,/g, "> <#") + "> \n"; //Genius
                if (command.hidden)
                    output += ":eyes: This command is **hidden**. How did you find it?\n";
                if (command.premium)
                    output += "<:ocelotbot:533369578114514945> This command requires **OcelotBOT Premium**\n";
                if (command.vote) {
                    if (message.getSetting("restrictionType") === "vote") {
                        output += "<:supporter_1:529308223954616322> This command requires you to **vote for OcelotBOT** every 24 hours.\n";
                    } else {
                        output += "<:supporter_1:529308223954616322> This command requires you to **join the Support Server**.\n";
                    }
                }
                if (command.categories.indexOf("nsfw") > -1)
                    output += "🔞 This command is **Not Safe For Work**\n";
                if (command.unwholesome)
                    output += "⭐ This command can't be used in **Wholesome Mode**\n";
                output += `**Usage:** ${message.getSetting("prefix")}${command.usage}\n`;
                if (command.usageExample)
                    output += `**Example:** ${command.usageExample}\n`;

                message.channel.send(output);

            } else {
                message.replyLang("COMMANDS_INVALID_CATEGORY", {arg: args[0]});
            }
        } else {
            let unique = []; //ahhh..
            let output = "";
            if (arg === "nsfw" && !message.channel.nsfw)
                output += "# NSFW Commands can only be used in NSFW channels.\n";
            const prefix = message.getSetting("prefix");
            let commandUsages = bot.commandUsages;
            if (args[1] && Object.keys(bot.commandCategories).indexOf(arg) > -1) {
                commandUsages = bot.commandCategories[arg];
            }
            for (let i in commandUsages) {
                if (commandUsages.hasOwnProperty(i) && !commandUsages[i].hidden && !message.getBool(`${i}.disable`) && !(commandUsages[i].unwholesome && message.getBool("wholesome")) && !(commandUsages[i].nsfw && message.getBool("allowNSFW")))
                    if (unique.indexOf(commandUsages[i].name) === -1) {
                        unique.push(commandUsages[i].name);
                        let usage = commandUsages[i].usage;
                        if (prefix[prefix.length - 1].match(alphaRegex))
                            usage[0] = usage[0].toUpperCase();
                        output += `${commandUsages[i].name}:: ${prefix}${commandUsages[i].usage}\n`
                    }
            }
            message.replyLang("COMMANDS", {commands: output});
        }
    }
};