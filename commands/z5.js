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
        let result = await bot.rabbit.rpc("z5", {name: "test", data: input, server : message.guild ? message.guild.id : message.channel.id});

        let text = decodeURIComponent(result.text);
        let channelMessage = "";

        let headerLines = text.split("\n\n");
        channelMessage += "```css\n" + headerLines[0] + "\n```";

        let body = headerLines.slice(1).join("\n\n");

        // split location and description, then colorize
        let lines = body.split("\n");
        let location = lines[0];
        let description = lines.slice(1).join("\n");
        channelMessage += "```fix\n" + location + "\n```";

        if (description.replace('\n', '').length > 0) {
            channelMessage += "```yaml\n" + description + "\n```";
        }

        if(result.text !== undefined) {
            message.channel.send(channelMessage);
        }
    }
};
