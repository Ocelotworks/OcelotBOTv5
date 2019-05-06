let JSZM = require('../jszm.js');
let fs = require("fs");
const Discord = require('discord.js');

let gameInProgress = {};
//let game;
let games = {};
let gameIterator = {};
let channel;


function startGame(id) {
    let file = fs.readFileSync("./MINIZORK.Z3", {});

    let game = new JSZM(file);
    console.log("Created new game");

    let buffer = "";
    let didPrintHeader = false;
    game.print = function* (text) {
        if (text.length === 1 && text === ">") {
            let channelMessage = "";
            // split by \n\n to pull out game header, only first time
            if (!didPrintHeader) {
                let headerLines = buffer.split("\n\n");
                channelMessage += "```css\n" + headerLines[0] + "\n```";
                buffer = headerLines.slice(1).join("\n\n");
                didPrintHeader = true;
            }

            // split location and description, then colorize
            let lines = buffer.split("\n");
            let location = lines[0];
            let description = lines.slice(1).join("\n");
            channelMessage += "```fix\n" + location + "\n```";
            if (description.replace('\n', '').length > 0) {
                channelMessage += "```yaml\n" + description + "\n```";
            }
            channel.send(channelMessage);

            buffer = "";
        } else {
            buffer += text;
        }

    };

    game.read = function* () {
        return yield "";
    };

    game.save = function* (data) {
        try {
            yield fs.writeFileSync("./z5saves/" + id, new Buffer(data.buffer), {});
            return true;
        } catch (e) {
            console.log(e);
            return false;
        }
    };

    game.restore = function* () {
        try {
            channel.send("Attempting restore");
            return new Uint8Array(fs.readFileSync("./z5saves/" + id, {}));
        } catch (e) {
            console.log(e);
            channel.send("Restore failed.")
            return null;
        }

    };

    gameIterator[id] = game.run();
    games[id] = game;
    console.log("Run");
    gameInProgress[id] = true;
}

module.exports = {
    name: "Z5 Interpreter",
    usage: "z7",
    commands: ["z5", "zork"],
    categories: ["fun"],
    run: async function (message, args, bot) {

        channel = message.channel;

        let id = (message.guild ? message.guild.id : message.author.id);

        switch (args[1]) {
            case("admin"): {
                if (bot.admins.indexOf(message.author.id) === -1) return;
                switch (args[2].toLowerCase()) {
                    case("list"): {
                        let buffer = "```Save games:\n";
                        fs.readdirSync("./z5saves/").forEach(file => {
                            buffer += file + "\n";
                        });
                        buffer += "```";
                        channel.send(buffer);
                        break;
                    }
                    case("killgame"): {
                        games[id] = null;
                        gameInProgress[id] = false;
                        gameIterator[id] = null;
                        channel.send("Killed current game.");
                        break;
                    }
                    case("killallgames"): {
                        games = {};
                        gameInProgress = {};
                        gameIterator = {};
                        channel.send("Killed all games.");
                        break;
                    }
                    case("loadother"): {
                        //todo: load other channel's save
                        startGame(id);

                        break;
                    }
                    case("saveother"): {
                        //games[id].getSerialData()).next()
                        try {
                            fs.writeFileSync("./z5saves/" + args[3], new Buffer(games[id].getSerialData().buffer), {});
                        } catch (e) {
                            console.log(e);
                            channel.send("Save failed.");
                            return;
                        }
                        channel.send("Saved.");
                    }
                    case("globalsave"): {
                        break;
                    }
                    case("globalrestore"): {
                        break;
                    }
                    case("newgame"): {
                        startGame(args[3]);
                        break;
                    }
                    case("force"): {
                        gameIterator[args[3]].next(Discord.escapeMarkdown(args.slice(3).join(" ")));
                        break;
                    }
                    case("listgames"): {
                        let buffer = "```Current games:\n";
                        Object.keys(games).forEach(function(key) {
                            buffer += key + "\n";
                        });
                        buffer += "```";
                        channel.send(buffer);
                        break;
                    }
                    default: {
                        break;
                    }
                }
                return;
            }
            default: {
            }
        }

        if (!gameInProgress[id] || gameInProgress[id] === undefined) {
            startGame(id);
        }

        let input = Discord.escapeMarkdown(args.slice(1).join(" "));

        gameIterator[id].next(input);

        /*if(input !== "restore") {
            if (games[id].save(games[id].getSerialData()).next()) {
                console.log("saved");
            } else {
                console.log("failed");
            }
        }*/

    }
};
