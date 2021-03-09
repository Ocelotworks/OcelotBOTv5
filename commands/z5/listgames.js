/**
 * Copyright 2019 Neil Trotter
 * Created 01/05/2019
 * (OcelotBOTv5) test
 */

module.exports = {
    name: "List Games",
    usage: "listgames",
    commands: ["listgames"],
    run: async function (message, args, bot, data) {
        let buffer = "```Current games:\n";
        Object.keys(data.gameContainers).forEach(function (key) {
            buffer += key + "\n";
        });
        buffer += "\nDead games:\n";
        Object.keys(data.gameContainers).forEach(function (key) {
            if (data.gameContainers[key].dead)
                buffer += key + "\n";
        });
        buffer += "```";
        message.channel.send(buffer);
    }
};