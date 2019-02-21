const Discord = require('discord.js');
const request = require('request');
const gm = require('gm');
const fs = require('fs');
module.exports = {
    name: "Bulge Image",
    usage: "bulge [url]",
    categories: ["image", "fun"],
    rateLimit: 10,
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["bulge", "explode", "buldge"],
    run: async function(message, args, bot){
        bot.util.processImageFilter(module, message, args, "implode", [message.getSetting("bulge.amount")]);
    }
};