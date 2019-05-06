module.exports = {
    name: "List Games",
    usage: "listgames",
    commands: ["listgames"],
    run: async function(message, args, bot, data){
        let buffer = "```Current games:\n";
        Object.keys(data.games).forEach(function (key) {
            buffer += key + "\n";
        });
        buffer += "```";
        message.channel.send(buffer);
    }
};