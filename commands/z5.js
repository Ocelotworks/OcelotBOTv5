let JSZM = require('../lib/jszm.js');
let fs = require("fs");
const Discord = require('discord.js');

let gameInProgress = {};
//let game;
let games = {};
let gameIterator = {};
let deadCount = {};
let channel;
let gBot;
let printHeader = {};
let deadGames = {};
let players = {};

const saves = __dirname+"/../z5saves/";


function onWon(id, bot) {
    players[id].forEach(function(value){
        gBot.database.giveBadge(value, 62);
    });
    channel.send("You won! Everyone involved in the game has received the <:zork:576842329789562930> Zork Badge on their !profile");
    deadGames[id] = true;
}

function startGame(id) {
    let file = fs.readFileSync(`${__dirname}/../z5games/MINIZORK.Z3`, {});


    let game = new JSZM(file);
    deadCount[id] = 0;
    deadGames[id] = false;
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
            if(location.contains("Barrow")){
                onWon(id);
            }
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

    game.quit = function *() {
        deadGames[id] = true;
        yield;
    };

    game.onDeath = function() {
        channel.send("Test");
    };

    game.read = function* () {
        return yield "";
    };

    game.save = function* (data) {
        try {
            fs.writeFileSync(saves + id, new Buffer(data.buffer), {});
            return true;
        } catch (e) {
            console.log(e);
            return false;
        }
    };

    game.restore = function* () {
        try {
            channel.send("Attempting restore");
            return new Uint8Array(fs.readFileSync(saves + id, {}));
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
        gBot = bot;

        let id = (message.guild ? message.guild.id : message.author.id);

        if(!players[id]){
            players[id] = [];
            if(players[id].indexOf(message.author.id) === -1)
                players[id].push(message.author.id);
        }

        if (args.length > 1 && args[1].toLowerCase() === "admin") {
            if (bot.admins.indexOf(message.author.id) === -1) return;
            bot.util.standardNestedCommand(message, args, bot, "z5", {
                    id: id,
                    games: games,
                    gameInProgress: gameInProgress,
                    deadCount: deadCount,
                    gameIterator: gameIterator,
                    printHeader: printHeader,
                    deadGames: deadGames
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

        games[id].commands++;
        if(games[id].commands % 10 === 0){
            fs.writeFileSync(__dirname+"/../z5saves/" + args[3], new Buffer(games[id].getSerialData().buffer), {});
            bot.logger.log("Saving game " + id);
        }
        gameIterator[id].next(input);

        if (deadCount[id] === 2) {
            channel.send(await bot.lang.getTranslation(id, "Z5_DEAD"));
            deadGames[id] = true;
        }

        if (deadGames[id]) {
            games[id] = undefined;
            gameInProgress[id] = false;
            gameIterator[id] = undefined;
            deadGames[id] = false;
        }
    }
};
