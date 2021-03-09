/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 11/02/2019
 * ╚════ ║   (ocelotbotv5) giveBadge
 *  ════╝
 */
const Discord = require('discord.js');
module.exports = {
    name: "Give Badge",
    usage: "giveBadge <user> <id>",
    commands: ["givebadge"],
    run: async function (message, args, bot) {
        let id = args[3];
        let user = message.mentions.users.first();
        bot.badges.giveBadge(user, message.channel, id);
    }
};