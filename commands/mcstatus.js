/**
 * Copyright 2019 Neil Trotter
 * Created 01/05/2019
 * (OcelotBOTv5) mcstatus
 */
let Gamedig = require('gamedig');
let Discord = require('discord.js');

module.exports = {
    name: "Minecraft Status",
    usage: "mc [ip] [port]",
    commands: ["mc", "minecraft"],
    categories: ["fun"],
    run: async function run(message, args, bot) {
        Gamedig.query({
            type: 'minecraft',
            host: args[1] || 'localhost',
            port: args[2] || '25565'
        }).then((state) => {
            console.log(state);
            let embed = new Discord.RichEmbed();
            embed.setColor(0x2471a3);
            embed.setAuthor((state.raw.description.text !== undefined ? state.raw.description.text : state.connect));
            embed.addField("Players", state.raw.players.online  +" / " + state.raw.players.max,true);
            embed.addField("Version", state.raw.version.name,true);
            embed.addField("Modded", (state.raw.modinfo !== undefined && state.raw.modinfo.type === "FML" ? "Yes" : "No"), true)
            message.channel.send("",embed);
        }).catch((error) => {
            console.log(error);
            message.channel.send("Server is offline");
        });
    }
};