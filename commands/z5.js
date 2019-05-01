var JSZM = require('../jszm.js');
var fs = require("fs");
var gameInProgress = false;
var game;

module.exports = {
    name: "Z5 Interpreter",
    usage: "z7",
    commands: ["z5"],
    categories: ["fun"],
    run: async function(message, args, bot) {

        if (!gameInProgress) {
            game = new JSZM(fs.readFile("../zdungeon.z5", {}));

            game.run();
        }
        gameInProgress = true;

        game.print = function* (text, scripting) {
            message.channel.send(text);
        };

        game.read = function* (maxlen) {
            return yield args[1];
        };

    }
};