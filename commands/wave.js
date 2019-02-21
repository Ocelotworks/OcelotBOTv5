const Discord = require('discord.js');
const request = require('request');
const gm = require('gm');
const fs = require('fs');
module.exports = {
    name: "Wave Image",
    usage: "wave [url]",
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["wave", "wavey", "waves"],
    categories: ["image", "fun"],
    run: async function(message, args, bot){
        bot.util.processImageFilter(module, message, args, "wave", [10, 50]);
    }
};