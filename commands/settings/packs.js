const SlashCommandManager = require("../../util/SlashCommandManager");
const Sentry = require('@sentry/node');
/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 23/03/2019
 * ╚════ ║   (ocelotbotv5) set
 *  ════╝
 */
let availablePacks = [{
    label: "Music",
    value: "music",
    description: "Enables /music command",
    emoji: {name: "🎵"}
}, {
    label: "NSFW",
    value: "nsfw",
    description: "Enables NSFW commands (in NSFW channels)",
    emoji: {name: "🔞"}
}];
module.exports = {
    name: "Manage Command Packs",
    usage: "packs",
    commands: ["packs"],
    run: async function (context, bot, data) {
        let guildPacks = context.getSetting("commands.guildPacks")?.split(",") || [];

        let row = bot.util.actionRow(bot.interactions.addDropdown("Select Packs", availablePacks.map((d)=>({...d, default: guildPacks.includes(d.value)})), async (interaction) => {
            try {
                const packs = interaction.values.join(",");
                let commandOutput = SlashCommandManager.GetCommandPacks(packs, bot.commandObjects);
                await bot.client.application.commands.set(commandOutput, context.guild.id);
                await bot.config.set(context.guild.id, "commands.guildPacks", packs);
                return interaction.reply({content: "Your command pack choices have been saved. Please allow for a few minutes for Discord to refresh the available commands.", ephemeral: true})
            }catch(e){
                Sentry.captureException(e);
                return interaction.reply({content: "There was an error saving your packs. Please try again later or contact support.", ephemeral: true})
            }
        }, 0, availablePacks.length));

        return context.send({content: "Enable or disable additional commands sets.", components: [row], ephemeral: true});
    }
};

