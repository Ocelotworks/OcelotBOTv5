let runningGames = {
};

let gameRequests = {
    dummy: {
        from: 10,
        to: 10,
        at: 0
    }
};

const chess = require('chess');

const cols = ["A", "B", "C"];
//const pieces = ["X", "O", " "];

const tileWhite = "▯";
const tileBlack = "▮";


const pieces = {
    white: {
        king:    "♔",
        queen:   "♕",
        rook:    "♖",
        bishop:  "♗",
        knight:  "♘",
        pawn:    "♙",
    },
    black: {
        king:    "♚",
        queen:   "♛",
        rook:    "♜",
        bishop:  "♝",
        knight:  "♞",
        pawn:    "♟",
    }
};

module.exports = {
    name: "Chess",
    usage: "chess start <@player>/<move>",
    accessLevel: 0,
    commands: ["chess", "playchess"],
    categories: ["games", "fun"],
    run: function run(message, args, bot){
        const subCommand = args[1];
        bot.raven.captureBreadcrumb({
            data: {
                subCommand: subCommand//,
                // runningGames: JSON.stringify(runningGames),
                // gameRequests: JSON.stringify(gameRequests)
            }
        });
        if(subCommand && module.exports.subCommands[subCommand.toLowerCase()]){
            module.exports.subCommands[subCommand.toLowerCase()](message, args, bot);
        }else if(runningGames[message.channel.id] && runningGames[message.channel.id].players[+runningGames[message.channel.id].turn].id === message.author.id && subCommand.match(/[a-z]{1,4}[0-9]/gi)) {
            module.exports.doGo(message, subCommand);
        }else{
            message.channel.send(`:bangbang: Invalid usage! To start a game type ${args[0]} start @player`);
        }

    },
    renderBoard: function(channel){
        const game = runningGames[channel].game;
        let output = "```\n";

        const gameStatus = game.getStatus();
        const board = gameStatus.board.squares;
        let black = false;
        for(let i = 0; i < board.length; i++){
            let tile = board[i];
            const pieceData = tile.piece;
            if(tile.file === "a")
                output += tile.rank;
            if(pieceData)
                output += pieces[pieceData.side.name][pieceData.type];
            else
                output += black ? tileBlack : tileWhite;
            if(tile.file === "h")
                output += "\n";
            else
                black = !black;
        }
        output += " 🇦 🇧 🇨 🇩 🇪 🇫 🇬 🇭\n```";


        if(gameStatus.board.isCheck)
            output += `\nCheck!`;
        if(gameStatus.board.isCheckmate) {
            output += `\nCheckmate!\n<@${runningGames[channel].players[+!runningGames[channel].turn].id}> wins!`;
            delete runningGames[channel];
        }
        if(gameStatus.board.isStalemate) {
            output += `\nStalemate!\nEveryone wins?`;
            delete runningGames[channel];
        }
        if(gameStatus.board.isRepetition)
            output += "\n3-Fold Repetition";

        return output;
    },
    doGo: async function(message, command){
        const channel = message.channel.id;
        const runningGame = runningGames[channel];
        if(runningGame){
            runningGame.game.move(command);
            if(runningGame.lastMessage)
                runningGame.lastMessage.delete();
            runningGame.lastMessage = await message.channel.send(module.exports.renderBoard(channel));
            runningGame.turn = !runningGame.turn;
        }else{
            message.channel.send("There is currently no game running. Start one with !chess start @player");
        }

    },
    subCommands: {
        start: function(message, args, bot){
            const currentGame = runningGames[message.channel.id];
            const command = args[0];
            if(currentGame){
                const authorIndex =currentGame.players.indexOf(message.author.id);
                if(authorIndex === -1){
                    message.channel.send(":warning: Only one game can be running in a channel at one time. Wait for the current one to end, or go to another channel.");
                }else if(authorIndex === currentGame.turn){
                    message.channel.send(`:warning: It is currently your turn in the current game! Do your move with ${command} <position> i.e ${args[0]} A1 or give up with ${command} quit`);
                }else{
                    message.channel.send(`:warning: There is already a game going on in this channel and you are in it. Wait for your opponent to move or give up with ${command} quit`);
                }
            }else{
                if(message.mentions && message.mentions.members && message.mentions.members.size > 0){
                    const target = message.mentions.members.first();
                    const now = new Date();
                    if(!gameRequests[message.channel.id])gameRequests[message.channel.id] = {};
                    gameRequests[message.channel.id][target.id] = {
                        at: now,
                        from: message.author,
                        to: target
                    };
                    message.channel.send(`:rotating_light: ${target}, ${message.author} challenges you to a game of **chess**! Type **${args[0]} accept** to start!`);
                }else{
                    message.channel.send(`:bangbang: You must mention a user to challenge. ${args[0]} start @user`);
                }
            }
        },
        accept: async function(message, args, bot){
            if(gameRequests[message.channel.id] && gameRequests[message.channel.id][message.author.id]){
                const request = gameRequests[message.channel.id][message.author.id];
                runningGames[message.channel.id] = {
                    turn: 0,
                    players: [request.from, message.author],
                    game: chess.create()
                };
                runningGames[message.channel.id].lastMessage = await message.channel.send(`${request.from}, your request has been accepted! It is your turn.\n${module.exports.renderBoard(message.channel.id)}\nMove with ${args[0]} [move]. i.e ${args[0]} e4\nIf you don't know how algebraic chess notation works, check out https://en.wikipedia.org/wiki/Algebraic_notation_(chess)#Notation_for_moves`);
                delete gameRequests[message.channel.id];
            }else{
                message.channel.send(`:bangbang: You don't currently have any game invites. Type **${args[0]} start @user** to start one yourself.`);
            }
        },
        resign: function(message, args, bot){
            const channel = message.channel.id;
            if(!runningGames[channel]){
                message.channel.send(`:warning: There are no games running! Type **${args[0]} start @user** to start one yourself.`);
            }else if(runningGames[channel].players[+runningGames[channel].turn].id !== message.author.id ){
                message.channel.send(":warning: Either you aren't in this current game or it's not your turn. You can only resign when it's your turn!");
            }else{
                message.channel.send(`:flag_white: ${message.author} resigned! <@${runningGames[channel].players[+!runningGames[channel].turn].id}> wins!`);
            }
            delete runningGames[message.channel.id];
        }


    }
};

