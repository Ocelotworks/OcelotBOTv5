/**
 * Copyright 2019 Neil Trotter
 * Created 01/05/2019
 * (OcelotBOTv5) test
 */

let fs = require("fs");

module.exports = {
    name: "Save",
    usage: "save <save name>",
    commands: ["save"],
    run: async function(message, args, bot, data){
        try {
            fs.writeFileSync(__dirname+"/../z5saves/" + args[3], new Buffer(data.gameContainers[data.id].game.getSerialData().buffer), {});
        } catch (e) {
            console.log(e);
            message.channel.send("Save failed.");
            return;
        }
        message.channel.send("Saved.");
    }
};