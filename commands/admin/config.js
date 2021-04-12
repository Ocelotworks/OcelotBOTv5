module.exports = {
    name: "Get Config",
    usage: "config <key>",
    commands: ["getconfig", "config"],
    run: function (message, args, bot) {
        let output = `Config Property: \`${args[2]}\`\n`;
        if (bot.feature && bot.feature.enabled && bot.feature.enabled(args[2].replace(/\./g, "-"), {
            userId: message.author.id,
            sessionId: message.guild.id,
        }))
            output += `**Feature Flag**: \`true\`\n`
        if (bot.config.cache[message.author.id])
            output += `**User**: \`${bot.config.cache[message.author.id][args[2]] || "Unset"}\`\n`
        if (bot.config.cache[message.guild.id])
            output += `**Guild**: \`${bot.config.cache[message.guild.id][args[2]] || "Unset"}\`\n`
        if (bot.config.cache.global)
            output += `**Global**: \`${bot.config.cache.global[args[2]] || "Unset"}\`\n`
        message.channel.send(output);
    }
};