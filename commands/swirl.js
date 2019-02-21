/**
 *   ╔════   Copyright 2018 Peter Maguire
 *  ║ ════╗  Created 15/12/2018
 * ╚════ ║   (ocelotbotv5) swirl
 *  ════╝
 */
const Discord = require('discord.js');
const request = require('request');
const gm = require('gm');
const fs = require('fs');
module.exports = {
    name: "Swirl Image",
    usage: "swirl [url]",
    rateLimit: 10,
    categories: ["image", "fun"],
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["swirl"],
    run: async function(message, args, bot){
        bot.util.processImageFilter(module, message, args, "swirl", [message.getSetting("swirl.amount")]);
    }
};