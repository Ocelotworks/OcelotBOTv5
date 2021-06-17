let runningGames = {};

let gameRequests = {
    dummy: {
        from: 10,
        to: 10,
        at: 0
    }
};
const Sentry = require('@sentry/node');
const chess = require('chess');

const files = ["a", "b", "c", "d", "e", "f", "g", "h"];

module.exports = {
    name: "Chess",
    //usage: "chess [subCommand?:start,resign,accept] :@player? :move+?",
    usage: "chess start @player/resign/accept/<move>",
    accessLevel: 0,
    detailedHelp: "Start a game of chess. If you don't know how to play chess, this game isn't for you.\nIf you do know how to play chess, it's probably also not for you.",
    usageExample: "chess start @Small P",
    responseExample: "🚨 @Small P, @Big P challenges you to a game of **chess**! Type **!chess accept** to start!",
    commands: ["chess", "playchess"],
    requiredPermissions: ["ATTACH_FILES"],
    categories: ["games"],
    run: function run(message, args, bot) {
        //return context.reply(JSON.stringify(context.options));
        const subCommand = args[1];
        Sentry.configureScope(function run(scope) {
            scope.addBreadcrumb({
                data: {
                    subCommand: subCommand//,
                    // runningGames: JSON.stringify(runningGames),
                    // gameRequests: JSON.stringify(gameRequests)
                }
            });
            if (subCommand && module.exports.subCommands[subCommand.toLowerCase()]) {
                module.exports.subCommands[subCommand.toLowerCase()](message, args, bot);
            } else if (subCommand && runningGames[message.channel.id] && runningGames[message.channel.id].players[+runningGames[message.channel.id].turn].id === message.author.id && subCommand.match(/[a-z]{1,4}[0-9]/gi)) {
                module.exports.doGo(message, subCommand, args, bot);
            } else {
                message.replyLang("GAME_INVALID_USAGE", {arg: args[0]});
            }
        });
    },
    renderBoard: async function (message, bot) {
        const game = runningGames[message.channel.id].game;
        let payload = {
            "components": [{"url": "chess/chessboard.png", "local": true}]
        }

        const gameStatus = game.getStatus();
        const board = gameStatus.board.squares;
        for (let i = 0; i < board.length; i++) {
            let tile = board[i];
            if (!tile.piece) continue;
            payload.components.push({
                url: `chess/${tile.piece.side.name}/${tile.piece.type}.png`,
                local: true,
                pos: {
                    x: 15 + ((tile.rank - 1) * 40),
                    y: 15 + (files.indexOf(tile.file) * 40)
                }
            })
        }

        let output = `Turn: ${runningGames[message.channel.id].players[+!runningGames[message.channel.id].turn]}`;
        if (gameStatus.board.isCheck)
            output += await bot.lang.getTranslation(message.channel.guild.id, "CHESS_CHECK");

        if (gameStatus.board.isCheckmate) {
            output += await bot.lang.getTranslation(message.channel.guild.id, "CHESS_CHECKMATE", {winner: runningGames[message.channel.id].players[+!runningGames[message.channel.id].turn].id});
            delete runningGames[message.channel.id];
        }
        if (gameStatus.board.isStalemate) {
            output += await bot.lang.getTranslation(message.channel.guild.id, "CHESS_STALEMATE");
            delete runningGames[message.channel.id];
        }
        if (gameStatus.board.isRepetition)
            output += await bot.lang.getTranslation(message.channel.guild.id, "CHESS_REPETITION");

        return await bot.util.imageProcessor(message, payload, "board", output);
    },
    doGo: async function (message, command, args, bot) {
        const channel = message.channel.id;
        const runningGame = runningGames[channel];
        if (runningGame) {
            try {
                runningGame.game.move(command);
                let newMessage = await module.exports.renderBoard(message, bot);
                if (runningGame.lastMessage && !runningGame.lastMessage.deleted) {
                    await runningGame.lastMessage.delete();
                }
                runningGame.lastMessage = newMessage;
                runningGame.turn = !runningGame.turn;
            } catch (e) {
                if(e.message.indexOf("Notation is invalid") === -1 && e.message.indexOf("Invalid mode") === -1)
                    bot.raven.captureException(e);
                let status = runningGame.game.getStatus();
                for (let move in status.notatedMoves) {
                    let moveData = status.notatedMoves[move];
                    if (moveData.src.piece.side.name === runningGame.turn ? "white" : "black") {
                        message.replyLang("CHESS_INVALID_NOTATION" + (moveData.dest.piece ? "_TAKE" : ""), {
                            move,
                            piece: moveData.src.piece.type,
                            file: moveData.dest.file,
                            rank: moveData.dest.rank
                        });
                        break;
                    }
                }
            }

        } else
            message.replyLang("GAME_NOT_RUNNING", {arg: args[0]});

    },
    subCommands: {
        start: function (message, args, bot) {
            const currentGame = runningGames[message.channel.id];
            if (currentGame) {
                const authorIndex = currentGame.players.indexOf(message.author.id);
                if (authorIndex === -1) {
                    message.replyLang("GAME_ALREADY_RUNNING");
                } else if (authorIndex === currentGame.turn) {
                    message.replyLang("CHESS_ALREADY_YOUR_TURN", {arg: args[0]});
                } else {
                    message.replyLang("CHESS_ALREADY_THEIR_TURN", {arg: args[0]});
                }
            } else {
                if (message.mentions && message.mentions.members && message.mentions.members.size > 0) {
                    const target = message.mentions.members.first();
                    const now = new Date();
                    if (!gameRequests[message.channel.id]) gameRequests[message.channel.id] = {};
                    gameRequests[message.channel.id][target.id] = {
                        at: now,
                        from: message.author,
                        to: target
                    };
                    message.replyLang("CHESS_CHALLENGE", {target: target.id, user: message.author.id, arg: args[0]});
                } else {
                    message.replyLang("GAME_CHALLENGE_NO_USER", {arg: args[0]});
                }
            }
        },
        accept: async function (message, args, bot) {
            if (gameRequests[message.channel.id] && gameRequests[message.channel.id][message.author.id]) {
                const request = gameRequests[message.channel.id][message.author.id];
                runningGames[message.channel.id] = {
                    turn: 0,
                    players: [request.from, message.author],
                    game: chess.create()
                };
                runningGames[message.channel.id].lastMessage = await message.replyLang("CHESS_ACCEPTED", {
                    user: request.from.id,
                    board: await module.exports.renderBoard(message, bot),
                    arg: args[0]

                });
                delete gameRequests[message.channel.id];
            } else {
                message.replyLang("GAME_NO_INVITES", {arg: args[0]});
            }
        },
        resign: function (message, args, bot) {
            const channel = message.channel.id;
            if (!runningGames[channel]) {
                message.replyLang("GAME_NOT_RUNNING", {arg: args[0]});
            } else if (runningGames[channel].players[+runningGames[channel].turn].id !== message.author.id) {
                message.replyLang("GAME_NO_RESIGN", {arg: args[0]});
            } else {
                message.replyLang("GAME_RESIGN", {
                    user: message.author.id,
                    winner: runningGames[channel].players[+!runningGames[channel].turn].id
                });
            }
            delete runningGames[message.channel.id];
        },
        notation: function (message) {
            message.channel.send("https://en.wikipedia.org/wiki/Algebraic_notation_(chess)#Notation_for_moves");
        }


    }
};

