const Discord = require("discord.js");
const SlashCommandManager = require("../../util/SlashCommandManager");

module.exports = {
    name: "Update Slash Commands",
    usage: "updateslashcommands :guild? :pack?",
    commands: ["updateslashcommands", "usc"],
    noCustom: true,
    run: async function (context, bot) {
        let commandOutput = [];
        try {
            let packs = context.options.pack?.split(",") || ["default"];
            let server;
            if (context.options.guild && context.options.guild !== "global")
                server = context.options.guild.toLowerCase() === "this" ? context.guild.id : context.options.guild;

            commandOutput = SlashCommandManager.GetCommandPacks(packs, bot.commandObjects);
            console.log(commandOutput);
            await context.send(`Putting ${commandOutput.length} slash commands in packs \`${packs.join(",")}\`...`);
            await bot.client.application.commands.set(commandOutput, server);
            if (server)
                return context.send(`Set ${commandOutput.length} slash commands for ${server}`);
            return context.send(`Set ${commandOutput.length} slash commands.`);
        }catch(e){
            context.send({files: [new Discord.MessageAttachment(Buffer.from(JSON.stringify(commandOutput, null, 1)), "slash.json")]})
            return context.send(e.message);
        }
    }
};

