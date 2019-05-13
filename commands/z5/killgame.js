/**
 * Copyright 2019 Neil Trotter
 * Created 01/05/2019
 * (OcelotBOTv5) test
 */

module.exports = {
    name: "Kill game",
    usage: "killgame [this | all | id] <id>",
    commands: ["killgame"],
    run: async function(message, args, bot, data){

        if(args.length < 4 || args[3].toLowerCase() === "self") {
            data.gameContainers[data.id] = undefined;
            message.channel.send("Killed current game.");
        } else if (args[3] === "all"){
            data.gameContainers = {};
            message.channel.send("Killed all games on this shard.");
        } else {
            data.gameContainers[args[3]] = undefined;
            message.channel.send("Killed specific game.");
        }
    }
};