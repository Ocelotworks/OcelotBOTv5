/**
 * Copyright 2019 Neil Trotter
 * Created 01/05/2019
 * (OcelotBOTv5) test
 */

const Discord = require('discord.js');

module.exports = {
    name: "Force input",
    usage: "forceinput <id> <text>",
    commands: ["force", "forceinput"],
    run: async function(message, args, bot, data){
        data.gameContainers[args[3]].gameIterator.next(Discord.escapeMarkdown(args.slice(4).join(" ")));
    }
};