/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 08/02/2019
 * ╚════ ║   (ocelotbotv5) rotate
 *  ════╝
 */
const Discord = require('discord.js');
const request = require('request');
const gm = require('gm');
const fs = require('fs');
module.exports = {
    name: "Rotate Image",
    usage: "rotate [url] [deg]",
    categories: ["image"],
    rateLimit: 20,
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["rotate", "rot"],
    run: async function(message, args, bot){
        let num = 90;
        if(args[1] && !isNaN(args[1]))
            num = args[1];
        else if(args[2] && !isNaN(args[2]))
            num = args[2];

        bot.util.processImageFilter(module, message, args, "rotate", ['black', num]);
    }
};