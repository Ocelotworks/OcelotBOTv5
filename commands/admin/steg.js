const axios = require('axios');
const fs = require('fs');
const child_process = require('child_process');
const Discord = require('discord.js');
module.exports = {
    name: "Steg Decode",
    usage: "steg <url>",
    commands: ["steg"],
    run: async function (message, args, bot) {
        let image = await bot.util.getImage(message, args);
        if (!image) return message.channel.send("No image found");
        let imageData = await axios.get(image, {
            responseType: 'arraybuffer'
        });
        fs.writeFileSync("temp/out.png", Buffer.from(imageData.data));
        child_process.execFile("lib/stego.exe", ["-r", "-imgi", "temp/out.png"], async (err, out) => {
            console.log(err);
            try {
                let output = "**Valid OcelotBOT Image**"
                if (out !== "OCELOTBOT") {
                    let data = JSON.parse(out);
                    output += "\nServer:";
                    let server = await cacheGet(bot.client.guilds, data.s);
                    if (server) output += ` **${server.name}**`;
                    output += ` (${data.s})\nChannel:`;
                    let channel = await cacheGet(bot.client.channels, data.c);
                    if (channel) output += ` **#${channel.name}**`;
                    output += ` (${data.c})\nUser:`;
                    let user = await cacheGet(bot.client.users, data.u);
                    if (user) output += ` **${user.tag}**`;
                    output += ` (${data.u})\nMessage: ${data.m}\nTimestamp: **${Discord.SnowflakeUtil.deconstruct(data.m).date.toLocaleString()}**`;
                }
                message.channel.send(output);
            } catch (e) {
                console.log(e);
                message.channel.send(`Unable to decode.`);
            }
        });
    }
}

async function cacheGet(cache, get) {
    try {
        return await cache.fetch(get)
    } catch (e) {
        return null
    }
}