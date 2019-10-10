/**
 * Copyright 2019 Neil Trotter
 * Created 01/05/2019
 * (ocelotbotv5) z5
 */

module.exports = {
    name: "Zork",
    usage: "zork <text>",
    categories: ["games"],
    commands: ["zork", "z5"],
    run: async function run(message, args, bot) {
        let input = message.cleanContent //get the input string, split it into a space separated array, slice the first entry ("!zork"), join the rest and then filter out any weird special characters
            .split(" ")
            .slice(1)
            .join(" ");
        let result = await bot.rabbit.rpc("z5", {name: "gameData", data: input, server : message.guild ? message.guild.id : message.channel.id, player : message.author.id});

        let text = decodeURIComponent(result.text);
        let channelMessage = "";

        if(result.loaded){
            channelMessage += "``` Previous save has been auto loaded \n Try '!z5 look' to see where you left off ```"
        }

        let headerLines = text.split("\n");
        channelMessage += "```css\n" + headerLines[0] + "\n```";

        let body = headerLines.slice(1).join("\n");

        channelMessage += "```yaml\n" + body + "\n```";

        if(result.text !== undefined) {
            message.channel.send(channelMessage);
        }
    }
};
