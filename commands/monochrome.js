const Discord = require('discord.js');
const request = require('request');
const gm = require('gm');
const fs = require('fs');
module.exports = {
    name: "Monochrome Image",
    usage: "monochrome [url]",
    rateLimit: 10,
    categories: ["image"],
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["monochrome", "blackandwhite"],
    run: async function(message, args, bot){
        return bot.util.processImageFilter(module, message, args, "monochrome", []);
    }
};