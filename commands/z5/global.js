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
                    fs.writeFileSync(__dirname+"/../z5saves/" + key, new Buffer(data.games[key].getSerialData().buffer), {});
                } catch (e) {
                    console.log(e);
                    buffer += "Save failed.";
                    return;
                }
                buffer += "Saved."
            });
            message.channel.send(buffer + "```");
        } else if (args[3].toLowerCase() === "load"){

        } else {
            message.replyLang("GENERIC_INVALID_USAGE", {arg: args[0]});
        }
    }
};