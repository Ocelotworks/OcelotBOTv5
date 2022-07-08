/**
 * Created by Peter on 07/06/2017.
 */
const Embeds = require("../util/Embeds");
const Icon = require("../util/Icon");
const Strings = require("../util/String");
const {MessageEditCommandContext} = require("../util/CommandContext");
const alphaRegex = /[a-z]/g;

const categoryData = {
    memes: {
        emoji: {name: "🍆"},
        colour: "#F396B9",
    },
    fun: {
        emoji: {name: "☺️"},
        colour: "#0559F3",
    },
    stats: {
        emoji: {name: "📈"},
        colour: "#E90C20"
    },
    image: {
        emoji: {name: "🖼️"},
        colour: "#228BBB"
    },
    tools: {
        emoji: {name: "🔧"},
        colour: "#CEA57E",
    },
    filter: {
        emoji: {name: "📸"},
        colour: "#9A7B36"
    },
    barcodes: {
        emoji: {name: "🦓"},
        colour: "#3C3C3C"
    },
    text: {
        emoji: {name: "💬"},
        colour: "#5675F6"
    },
    nsfw: {
        emoji: {name: "👀"},
        colour: "#A9544F"
    },
    games: {
        emoji: {name: "🕹️"},
        colour: "#6B13C7"
    },
    meta: {
        emoji: {name: "ocelotbot", id: "914579250202419281"},
    },
    search: {
        emoji: {name: "🔎"},
        colour: "#FCF804"
    },
    voice: {
        emoji: {name: "🎤"},
        colour: "#243943"
    },
}

module.exports = {
    name: "Help Command",
    usage: "help :command?",
    detailedHelp: "Get a list of commands here.",
    usageExample: "help",
    commands: ["help", "commands"],
    categories: ["meta"],
    init: function init(bot) {
        bot.bus.once("commandLoadFinished",()=>{
            try {
                bot.logger.log("Generating help categories");
                bot.commandCategories = {};
                for (let i in bot.commandObjects) {
                    const commandUsage = bot.commandObjects[i];
                    for (let j = 0; j < commandUsage.categories.length; j++) {
                        const category = commandUsage.categories[j];
                        if (bot.commandCategories[category] && !bot.commandCategories[category][commandUsage.id]) {
                            bot.commandCategories[category][commandUsage.id] = commandUsage;
                        } else if (!bot.commandCategories[category]) {
                            bot.commandCategories[category] = {[commandUsage.id]: commandUsage};
                        }
                    }
                }
            }catch(e){
                console.error(e);
            }
        });
    },
    run: async function run(context, bot) {

        let categories = Object.keys(bot.commandCategories).filter((cat) => {
            return !context.getSetting("help.hiddenCategories")?.includes(cat) && !(cat === "nsfw" && (context.getBool("disableNSFW") || context.getBool("wholesome")))
        }).map((cat) => ({
            label: context.getLang(`HELP_CATEGORY_${cat.toUpperCase()}_LABEL`),
            description: context.getLang(`HELP_CATEGORY_${cat.toUpperCase()}_DESC`),
            value: cat,
            default: context.options.command === cat,
            emoji: categoryData[cat]?.emoji,
        }));

        // Don't show custom commands on interaction commands yet
        if(context.message && context.guild) categories.push({
            label: context.getLang(`HELP_CATEGORY_CUSTOM_LABEL`),
            description: context.getLang(`HELP_CATEGORY_CUSTOM_DESC`),
            value: "custom",
            default: context.options.command === "custom",
            emoji: {name: "⭐"}
        });

        let message;
        const dropdown = bot.util.actionRow(bot.interactions.addDropdown("Select Category...", categories, async (interaction) => {
            const categoryID = interaction.values[0];
            const newContext = Object.create(context);
            newContext.options = {command: categoryID}
            if(message)message.delete();
            message = await bot.command.runCommand(newContext);
        }, 1, 1))

        if(!context.options.command) {
            const embed = new Embeds.AuthorEmbed(context);
            embed.setTitleLang("HELP_TITLE");
            embed.setDescriptionLang("HELP_DESC");

            return message = await context.send({
                embeds: [embed],
                components: [dropdown],
                ephemeral: true
            });
        }

        if(bot.commandCategories[context.options.command]){
            let slashCommands = await bot.client.application.commands.fetch().then((c)=>c.reduce((acc, data)=>{acc[data.name] = data.id; return acc}, {}));

            const embed = new Embeds.AuthorEmbed(context);
            const catData = categoryData[context.options.command];
            if(catData?.colour)
                embed.setColor(catData?.colour);

            embed.setTitleLang(`HELP_CATEGORY_${context.options.command.toUpperCase()}_LABEL`);
            embed.setDescriptionLang("HELP_CATEGORY_DESC");

            const keys = Object.keys(bot.commandCategories[context.options.command]).filter((command)=>{
                let cmd = bot.commandCategories[context.options.command][command];
                return (!context.interaction || !cmd.slashHidden) && !cmd.hidden && !(cmd.unwholesome && context.getBool("wholesome")) && !(cmd.categories?.includes("nsfw") && context.getBool("disableNSFW")) && !context.getBool(`${cmd.commands[0]}.disable`)
            });

            keys.forEach((command)=>{
                let cmd = bot.commandCategories[context.options.command][command];
                let commandName = cmd.commands[0];
                if(context.interaction && slashCommands[commandName]){
                    embed.addField(cmd.name, `${Strings.Truncate(cmd.detailedHelp||"", 32)}\n</${commandName}:${slashCommands[commandName]}>`);
                }else {
                    // Some slash commands exist in a sub-category so make sure we display that
                    if (context.interaction && cmd.slashCategory)
                        commandName = `${cmd.slashCategory} ${commandName}`;
                    embed.addField(cmd.name, `${Strings.Truncate(cmd.detailedHelp || "", 32)}\n\`${context.getSetting("prefix")}${commandName} ${Strings.PrintCommandUsage(cmd.pattern)}\``, keys.length > 5)
                }
            })

            return message = await context.send({
                embeds: [embed],
                components: [dropdown],
                ephemeral: true
            });
        }

        // Custom Commands Category
        if(context.options.command === "custom" && context.guild){
            if(bot.customFunctions.COMMAND[context.guild.id]) {
                const embed = new Embeds.AuthorEmbed(context);
                embed.setTitleLang("HELP_CATEGORY_CUSTOM_LABEL");
                embed.setDescriptionLang("HELP_CATEGORY_CUSTOM_LIST_DESC");
                const customCommands = Object.keys(bot.customFunctions.COMMAND[context.guild.id]);
                embed.addField("Available Commands", customCommands.map((c)=>`${context.getSetting("prefix")}${c}`).join("\n"));
                return message = await context.send({
                    embeds: [embed],
                    components: [dropdown],
                    ephemeral: true
                });
            }
            return message = await context.sendLang({
                content: "HELP_NO_CUSTOM_COMMANDS",
                embeds: [],
                components: [dropdown],
                ephemeral: true
            });
        }
        // Command
        if (!bot.commandUsages[context.options.command]) {
            return message = await context.sendLang({
                content: "COMMANDS_INVALID_CATEGORY",
                embeds: [],
                components: [dropdown],
                ephemeral: true
            });
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

        output += `**Usage:** ${context.getSetting("prefix")}`
        if (context.interaction && command.slashCategory)
            output += `${command.slashCategory} `;
        output += `${context.options.command} ${Strings.PrintCommandUsage(command.pattern)}\n`;
        if (command.usageExample)
            output += `**Example:** ${context.getSetting("prefix")}${command.usageExample}\n`;

        return message = await context.send({
            content: output,
            embeds: [],
            components: [dropdown],
            ephemeral: true
        });


    }
};


function shouldShowCommand(context, usage){
    return !usage.hidden && // Not Hidden
        !context.getBool(`${usage.commands[0]}.disable`) && // Not Disabled
        !(usage.unwholesome && context.getBool("wholesome")) && // Not unwholesome in wholesome mode
        !(usage.nsfw && context.getBool("disableNSFW")) // Not NSFW with disableNSFW
}