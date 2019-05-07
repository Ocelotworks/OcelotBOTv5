module.exports = {
    name: "Kill game",
    usage: "killgame [this | all | id] <id>",
    commands: ["killgame"],
    run: async function(message, args, bot, data){

        if(args.length < 4 || args[3].toLowerCase() === "self") {
            data.games[data.id] = null;
            data.gameInProgress[data.id] = false;
            data.gameIterator[data.id] = null;
            message.channel.send("Killed current game.");
        } else if (args[3] === "all"){
            data.games = {};
            data.gameInProgress = {};
            data.gameIterator = {};
            message.channel.send("Killed all games on this shard.");
        } else {
            data.games[args[3]] = null;
            data.gameInProgress[args[3]] = false;
            data.gameIterator[args[3]] = null;
            message.channel.send("Killed specific game.");
        }
    }
};