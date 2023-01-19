module.exports = {
    name: "Get Config",
    usage: "config :key",
    commands: ["getconfig", "config"],
    slashHidden: true,
    run: function (context, bot) {
        let output = `Config Property: \`${context.options.key}\`\n`;
        if (bot.feature && bot.feature.enabled && bot.feature.enabled(context.options.key.replace(/\./g, "-"), {
            userId: context.user.id,
            sessionId: context.guild?.id,
        }))
            output += `**Feature Flag**: \`true\`\n`
        if (bot.config.cache[context.user.id])
            output += `**User**: \`${bot.config.cache[context.user.id][context.options.key] || "Unset"}\`\n`
        if (bot.config.cache[context.guild?.id])
            output += `**Guild**: \`${bot.config.cache[context.guild?.id][context.options.key] || "Unset"}\`\n`
        if (bot.config.cache.global)
            output += `**Global**: \`${bot.config.cache.global[context.options.key] || "Unset"}\`\n`
        context.send(output);
    }
};