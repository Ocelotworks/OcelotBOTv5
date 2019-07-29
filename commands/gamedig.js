/**
 * Copyright 2019 Neil Trotter
 * Created 01/05/2019
 * (OcelotBOTv5) gamedig
 */
let Gamedig = require('gamedig');
let Discord = require('discord.js');
let hiddenMods = ["minecraft", "mcp", "forge", "FML"];

module.exports = {
    name: "Gamedig",
    usage: "gamedig <game> <ip> [port]",
    commands: ["game", "gd", "gamedig"],
    categories: ["fun"],
    run: async function run(message, args, bot) {
        Gamedig.query({
            type: args[1],
            host: args[2],
            port: args[3]
        }).then((state) => {
            console.log(state);
            let embed = new Discord.RichEmbed();
            embed.setColor(0x2471a3);
            embed.setTitle(state.name || state.connect);
            let buffer = "";

            state.players.forEach(function (value){
                buffer += (value.name ? value.name : "Unknown player")+ "\n";
            });

            embed.addField("Players", state.players.length  +" / " + state.maxplayers + "\n\n" + buffer,true);
            message.channel.send("",embed);
        }).catch((error) => {
            console.log(error);
            message.channel.send("Server is offline");
        });
    }
};