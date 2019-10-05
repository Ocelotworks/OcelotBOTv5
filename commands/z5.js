/**
 * Copyright 2019 Neil Trotter
 * Created 01/05/2019
 * (ocelotbotv5) z5
 */


let JSZM = require('../lib/jszm.js');
let fs = require("fs");
const Discord = require('discord.js');

let channel;
let gameContainers = {};

function createGameContainer() {
    return {
        gameInProgress: false,
        game: undefined,
        gameIterator: undefined,
        dead: undefined,
        deaths: 0,
        printHeader: "",
        players: [],
        bot: undefined
    }
}

const saves = __dirname + "/../z5saves/";


function onWon(id) {
    gameContainers[id].players[id].forEach(function (value) {
        gameContainers[id].bot.database.giveBadge(value, 62);
    });
    channel.send("You won! Everyone involved in the game has received the <:zork:576842329789562930> Zork Badge on their !profile");
    gameContainers[id].dead = true;
}

function startGame(id) {
    let file = fs.readFileSync(`${__dirname}/../z5games/MINIZORK.Z3`, {});

    gameContainers[id].game = new JSZM(file);
    gameContainers[id].deaths = 0;
    gameContainers[id].dead = false;
    console.log("Created new game");

    let buffer = "";
    let didPrintHeader = false;
    gameContainers[id].game.print = function* (text) {
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
            if (gameContainers[id].printHeader !== "") {
                channelMessage += "```diff\n" + gameContainers[id].printHeader + "\n```";
                gameContainers[id].printHeader = "";
            }
            channelMessage += "```fix\n" + location + "\n```";
            if (location.indexOf("Barrow") !== -1) {
                onWon(id);
            }
            if (description.replace('\n', '').length > 0) {
                channelMessage += "```yaml\n" + description + "\n```";
                if (channelMessage.includes("You have died")) {
                    gameContainers[id].deaths++;
                }
            }
            channel.send(channelMessage);


            buffer = "";
        } else {
            buffer += text;
        }

    };

    gameContainers[id].game.quit = function* () {
        gameContainers[id].dead = true;
        yield;
    };

    gameContainers[id].game.read = function* () {
        return yield "";
    };

    gameContainers[id].game.save = function* (data) {
        try {
            fs.writeFileSync(saves + id, new Buffer(data.buffer), {});
            return true;
        } catch (e) {
            console.log(e);
            return false;
        }
    };

    gameContainers[id].game.restore = function* () {
        try {
            channel.send("Attempting restore");
            return new Uint8Array(fs.readFileSync(saves + id, {}));
        } catch (e) {
            console.log(e);
            channel.send("Restore failed.");
            return null;
        }

    };

    gameContainers[id].gameIterator = gameContainers[id].game.run();
    gameContainers[id].gameInProgress = true;
}

module.exports = {
    name: "Zork",
    usage: "zork [action]",
    commands: ["zork", "z5"],
    categories: ["games"],
    init: function init(bot) {
        bot.logger.log("Loading z5 commands...");
        bot.util.standardNestedCommandInit("z5");

        process.on('message', async function (message) {
            if (message.type === "destruct") {
                bot.logger.log("Z5 got destruct. Forcing save of all games in progress...")

                Object.keys(gameContainers).forEach(function (key) {
                    try {
                        fs.writeFileSync(__dirname + "/../z5saves/" + key, new Buffer(gameContainers[key].game.getSerialData().buffer), {});
                    } catch (e) {
                        console.log(e);
                    }
                });

                bot.logger.log("Saved!")
            }
        });
    },
    run: async function (message, args, bot) {

        channel = message.channel;
        let id = (message.guild ? message.guild.id : message.author.id);

        //Do admin commands
        if (args.length > 1 && args[1].toLowerCase() === "admin") {
            if (bot.admins.indexOf(message.author.id) === -1) return;
            bot.util.standardNestedCommand(message, args, bot, "z5", {id, gameContainers}, null, 2);
            return;
        }

        //Create new game if there isn't one
        if (!gameContainers[id] || gameContainers[id] === undefined) {
            gameContainers[id] = createGameContainer();
            if (fs.existsSync("./z5saves/" + id)) {
                gameContainers[id].printHeader = await bot.lang.getTranslation(id, "Z5_SAVE_WARNING");
            }
            startGame(id);
            gameContainers[id].bot = bot;
        }

        //Add player if they're new
        if (gameContainers[id].players.indexOf(message.author.id) === -1)
            gameContainers[id].players.push(message.author.id);


        let input = message.cleanContent //get the input string, split it into a space separated array, slice the first entry ("!zork"), join the rest and then filter out any weird special characters
            .split(" ")
            .slice(1)
            .join(" ")
            .replace(/>/g, "");

        // Auto-save every 10 commands run
        gameContainers[id].game.commands++;
        if (gameContainers[id].game.commands % 10 === 0) {
            fs.writeFileSync(__dirname + "/../z5saves/" + args[3], new Buffer(games[id].getSerialData().buffer), {});
            bot.logger.log("Saving game " + id);
        }

        //Feed input to JSZM
        gameContainers[id].gameIterator.next(input);


        //Check player and game deaths
        if (gameContainers[id].deaths === 2) {
            channel.send(await bot.lang.getTranslation(id, "Z5_DEAD"));
            gameContainers[id].dead = true;
        }

        if (gameContainers[id].dead) {
            gameContainers[id] = undefined;
            bot.logger.log("Game is dead: " + id);
        }
    }
};
