const Discord = require('discord.js');

module.exports = {
    name: "Force input",
    usage: "forceinput <id> <text>",
    commands: ["force", "forceinput"],
    run: async function(message, args, bot, data){
        data.gameIterator[args[3]].next(Discord.escapeMarkdown(args.slice(4).join(" ")));
    }
};