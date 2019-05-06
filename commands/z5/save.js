let fs = require("fs");

module.exports = {
    name: "Save",
    usage: "save <save name>",
    commands: ["save"],
    run: async function(message, args, bot, data){
        try {
            fs.writeFileSync("./z5saves/" + args[3], new Buffer(data.games[data.id].getSerialData().buffer), {});
        } catch (e) {
            console.log(e);
            message.channel.send("Save failed.");
            return;
        }
        message.channel.send("Saved.");
    }
};