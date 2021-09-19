/**
 * Copyright 2019 Neil Trotter
 * Created 01/05/2019
 * (ocelotbotv5) z5
 */

const Discord = require('discord.js');

module.exports = {
    name: "Zork",
    usage: "zork :input?+",
    detailedHelp: "The classic computer game Zork",
    categories: ["games"],
    commands: ["zork", "z5"],
    run: async function run(context, bot) {
        let input = context.options.input;
        let result = await bot.rabbit.rpc("z5", {
            name: "gameData",
            data: input,
            server: context.guild ? context.guild.id : context.channel.id, player: context.user.id,
            admin: context.getBool("admin")
        }, 300000, {durable: false});

        let text = Discord.Util.escapeMarkdown(decodeURIComponent(result.text));
        let channelMessage = "";

        if (result.loaded) {
            channelMessage += "``` Previous save has been auto loaded \n Try '!z5 look' to see where you left off ```"
        }

        let headerLines = text.split("\n");
        channelMessage += "```css\n" + headerLines[0] + "\n```";

        let body = headerLines.slice(1).join("\n");

        channelMessage += "```yaml\n" + body + "\n```";

        if (result.text !== undefined) {
            return context.send(channelMessage);
        }

        // if(headerLines[0].indexOf("Barrow") !== -1){
        //     result.players.forEach(async function (value) {
        //        await bot.database.giveBadge(value, 62);
        //     });
        //     message.channel.send("You won! Everyone involved in the game has received the <:zork:576842329789562930> Zork Badge on their !profile");
        // }
    }
};
