module.exports = {
    name: "Emoji Search",
    usage: "emoji :term+",
    categories: ["tools"],
    requiredPermissions: [],
    detailedHelp: "Find emojis in other servers",
    usageExample: "emoji pogchamp",
    commands: ["emoji", "emojisearch", "emojis", "emote"],
    run: async function (context, bot) {
        let output = "";
        let emojiCount = 0;
        bot.client.emojis.cache.forEach(function (emoji) {
            if(emoji.guild && (!context.guild || emoji.guild.id !== context.guild.id) && bot.config.getBool(emoji.guild.id, "privacy.serverAnonymous"))return;
            if (emoji.name.toLowerCase().indexOf(context.options.term.toLowerCase()) > -1 && output.length <= 1900 && emojiCount < context.getSetting("emoji.count")) {
                emojiCount++;
                output += emoji.toString();
            }
        });
        if (output)
            context.send(output);
        else
            context.sendLang("EMOJI_NOT_FOUND");
    }
};