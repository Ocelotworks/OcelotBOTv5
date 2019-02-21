/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 08/02/2019
 * ╚════ ║   (ocelotbotv5) paint
 *  ════╝
 */
const Discord = require('discord.js');
const request = require('request');
const gm = require('gm');
const fs = require('fs');
module.exports = {
    name: "Oil Painting",
    usage: "pain [url]",
    categories: ["image"],
    rateLimit: 10,
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["paint", "oil", "oilpaint"],
    run: async function(message, args, bot){
        bot.util.processImageFilter(module, message, args, "paint", [10]);
    }
};