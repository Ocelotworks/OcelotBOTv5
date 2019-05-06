let JSZM = require('../jszm.js');
let fs = require("fs");
const Discord = require('discord.js');

let gameInProgress = {};
//let game;
let games = {};
let gameIterator = {};
let deadCount = {};
let channel;
let printHeader = {};


function startGame(id) {
    let file = fs.readFileSync("./MINIZORK.Z3", {});

    let game = new JSZM(file);
    deadCount[id] = 0;
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
            if (printHeader[id] !== "") {
                channelMessage += "```diff\n" + printHeader[id] + "\n```";
                printHeader[id] = "";
            }
            channelMessage += "```fix\n" + location + "\n```";
            if (description.replace('\n', '').length > 0) {
                channelMessage += "```yaml\n" + description + "\n```";
                if (channelMessage.includes("You have died")) {
                    deadCount[id]++;
                }
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
            fs.writeFileSync("./z5saves/" + id, new Buffer(data.buffer), {});
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
            channel.send("Restore failed.");
            return null;
        }

    };

    gameIterator[id] = game.run();
    games[id] = game;
    console.log("Run");
    gameInProgress[id] = true;
}

module.exports = {
    name: "Zork",
    usage: "zork [action]",
    commands: ["zork", "z5"],
    categories: ["games"],
    init: function init(bot) {
        bot.logger.log("Loading z5 commands...");
        bot.util.standardNestedCommandInit("z5");
    },
    run: async function (message, args, bot) {

        channel = message.channel;

        let id = (message.guild ? message.guild.id : message.author.id);

        if (args.length > 1 && args[1].toLowerCase() === "admin") {
            if (bot.admins.indexOf(message.author.id) === -1) return;
            bot.util.standardNestedCommand(message, args, bot, "z5", {
                    id: id,
                    games: games,
                    gameInProgress: gameInProgress,
                    deadCount: deadCount,
                    gameIterator: gameIterator,
                    printHeader: printHeader
                },
                null, 2);
            return;
        }

        if (!gameInProgress[id] || gameInProgress[id] === undefined) {
            if (fs.existsSync("./z5saves/" + id)) {
                printHeader[id] = await bot.lang.getTranslation(id, "Z5_SAVE_WARNING");
            }
            startGame(id);
        }

        let input = Discord.escapeMarkdown(args.slice(1).join(" "));

        console.log(deadCount[id]);
        if (deadCount[id] === 2) {
            channel.send(await bot.lang.getTranslation(id, "Z5_DEAD"));
            gameIterator[id] = null;
            gameInProgress[id] = false;
            games[id] = null;
        } else {
            gameIterator[id].next(input);
        }

        /*if(input !== "restore") {
            if (games[id].save(games[id].getSerialData()).next()) {
                console.log("saved");
            } else {
                console.log("failed");
            }
        }*/

    }
};
