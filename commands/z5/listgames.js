module.exports = {
    name: "List Games",
    usage: "listgames",
    commands: ["listgames"],
    run: async function(message, args, bot, data){
        let buffer = "```Current games:\n";
        Object.keys(data.games).forEach(function (key) {
            buffer += key + "\n";
        });
        buffer += "\nDead games:\n";
        Object.keys(data.deadGames).forEach(function (key) {
            if(data.deadGames[key])
                buffer += key + "\n";
        });
        buffer += "```";
        message.channel.send(buffer);
    }
};