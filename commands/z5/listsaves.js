let fs = require("fs");

module.exports = {
    name: "List Saves",
    usage: "listsaves",
    commands: ["listsaves"],
    run: async function(message, args, bot, data){
        let buffer = "```Save games:\n";
        fs.readdirSync(__dirname+"/../z5saves/").forEach(file => {
            buffer += file + "\n";
        });
        buffer += "```";
        message.channel.send(buffer);
    }
};