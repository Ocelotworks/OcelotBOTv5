/**
 * Copyright 2019 Neil Trotter
 * Created 01/05/2019
 * (OcelotBOTv5) test
 */

let fs = require("fs");

module.exports = {
    name: "Global Save / Load",
    usage: "global <save | load>",
    commands: ["global"],
    run: async function(message, args, bot, data){
        if(args[3] === undefined){
            message.replyLang("GENERIC_INVALID_USAGE", {arg: args[0]});
            return;
        }

        if(args[3].toLowerCase() === "save"){
            let buffer = "```State:\n";
            Object.keys(data.games).forEach(function (key) {
                try {
                    fs.writeFileSync(__dirname+"/../z5saves/" + key, new Buffer(data.gameContainers[key].game.getSerialData().buffer), {});
                } catch (e) {
                    console.log(e);
                    buffer += "Save failed.";
                    return;
                }
                buffer += "Saved."
            });
            message.channel.send(buffer + "```");
        } else if (args[3].toLowerCase() === "load"){
            let buffer = "```State:\n";
            Object.keys(data.games).forEach(function (key) {
                try {
                    buffer += ("Attempting restore...");
                    data.gameContainers[data.id].game.setSerialData(new Uint8Array(fs.readFileSync("./z5saves/" + key, {})));
                    buffer += ("Load done. \n");
                } catch (e) {
                    console.log(e);
                    buffer += "Load failed. \n";
                    return;
                }
                buffer += "Loaded."
            });
            message.channel.send(buffer + "```");
        } else {
            message.replyLang("GENERIC_INVALID_USAGE", {arg: args[0]});
        }
    }
};