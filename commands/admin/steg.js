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
        if(!image)return message.channel.send("No image found");
        let imageData = await axios.get(image,{
            responseType: 'arraybuffer'
        });
        fs.writeFileSync("../temp/out.png", Buffer.from(imageData.data));
        child_process.execFile("../lib/stego", ["-r", "-imgi", "../temp/out.png"], (err, out)=>{
            try{
                if(out === "OCELOTBOT"){
                    message.channel.send("Valid OcelotBOT Image");
                }else{
                    let data = JSON.parse(out);
                    message.channel.send(`**Valid OcelotBOT Image.**\nUser: ${data.u}\nServer: ${data.s}\nChannel: ${data.c}\nMessage: ${data.m}\nTimestamp: ${Discord.SnowflakeUtil.deconstruct(data.m).date}`);
                }
            }catch(e){
                console.log(e);
                message.channel.send(`Unknown input: \`${out}\``);
            }

        })

    }
}