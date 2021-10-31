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
const Image = require('../util/Image');
const files = ["a", "b", "c", "d", "e", "f", "g", "h"];

module.exports = {
    name: "Chess",
    usage: "chess [subcommand?:start,resign,accept,notation] :@user? :move+?",
    detailedHelp: "Start a game of chess. If you don't know how to play chess, this game isn't for you.\nIf you do know how to play chess, it's probably also not for you.",
    usageExample: "chess start @Small P",
    responseExample: "🚨 @Small P, @Big P challenges you to a game of **chess**! Type **!chess accept** to start!",
    commands: ["chess", "playchess"],
    requiredPermissions: ["ATTACH_FILES"],
    categories: ["games"],
    run: function run(context, bot) {
        //return context.reply(JSON.stringify(context.options));
        const subCommand = context.options.subcommand;
        Sentry.configureScope(function run(scope) {
            scope.addBreadcrumb({
                data: {
                    subCommand: subCommand//,
                    // runningGames: JSON.stringify(runningGames),
                    // gameRequests: JSON.stringify(gameRequests)
                }
            });
            if (subCommand && module.exports.subCommands[subCommand.toLowerCase()]) {
                return module.exports.subCommands[subCommand.toLowerCase()](context, bot);
            }
            if (context.options.move && runningGames[context.channel.id] && runningGames[context.channel.id].players[+runningGames[context.channel.id].turn].id === context.user.id && context.options.move.match(/[a-z]{1,4}[0-9]/gi)) {
                return module.exports.doGo(context, context.options.move, bot);
            }
            context.sendLang({content: "GAME_INVALID_USAGE", ephemeral: true}, {arg: context.command});
        });
    },
    renderBoard: async function (context, bot, isFirstRun) {
        const game = runningGames[context.channel.id].game;
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

        let output = "Board:\n";
        if(!isFirstRun) {
            output = `Turn: ${runningGames[context.channel.id].players[+!runningGames[context.channel.id].turn]}`;
            if (gameStatus.board.isCheck)
                output += context.getLang("CHESS_CHECK");

            if (gameStatus.board.isCheckmate) {
                output += context.getLang("CHESS_CHECKMATE", {winner: runningGames[context.channel.id].players[+!runningGames[context.channel.id].turn].id});
                delete runningGames[context.channel.id];
            }
            if (gameStatus.board.isStalemate) {
                output += context.getLang("CHESS_STALEMATE");
                delete runningGames[context.channel.id];
            }
            if (gameStatus.board.isRepetition)
                output += context.getLang("CHESS_REPETITION");
        }

        return await Image.ImageProcessor(bot, context,  payload, "board", output);
    },
    doGo: async function (context, command, bot) {
        const channel = context.channel.id;
        const runningGame = runningGames[channel];
        if (runningGame) {
            try {
                runningGame.game.move(command);
                let newMessage = await module.exports.renderBoard(context, bot);
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
                        context.sendLang({
                            content: "CHESS_INVALID_NOTATION" + (moveData.dest.piece ? "_TAKE" : ""),
                           // components: [bot.util.actionRow(bot.interactions.suggestedCommand(context, move))]
                        }, {
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
            context.sendLang("GAME_NOT_RUNNING", {arg: context.command});

    },
    subCommands: {
        start: async function (context, bot) {
            const currentGame = runningGames[context.channel.id];
            if (currentGame) {
                const authorIndex = currentGame.players.indexOf(context.user.id);
                if (authorIndex === -1) {
                    context.sendLang("GAME_ALREADY_RUNNING");
                } else if (authorIndex === currentGame.turn) {
                    context.sendLang("CHESS_ALREADY_YOUR_TURN", {arg: context.command});
                } else {
                    context.sendLang("CHESS_ALREADY_THEIR_TURN", {arg: context.command});
                }
            } else {
                if (context.options.user) {
                    const target = await context.getMember(context.options.user);
                    const now = new Date();
                    if (!gameRequests[context.channel.id]) gameRequests[context.channel.id] = {};
                    gameRequests[context.channel.id][target.id] = {
                        at: now,
                        from: context.user,
                        to: target
                    };
                    context.sendLang("CHESS_CHALLENGE", {target: target.id, user: context.user.id, arg: context.command});
                } else {
                    context.sendLang("GAME_CHALLENGE_NO_USER", {arg: context.command});
                }
            }
        },
        accept: async function (context, bot) {
            if (gameRequests[context.channel.id] && gameRequests[context.channel.id][context.user.id]) {
                const request = gameRequests[context.channel.id][context.user.id];
                runningGames[context.channel.id] = {
                    turn: 0,
                    players: [request.from, context.user],
                    game: chess.create()
                };
                runningGames[context.channel.id].lastMessage = await context.sendLang("CHESS_ACCEPTED", {
                    user: request.from.id,
                    board: await module.exports.renderBoard(context, bot, true),
                    arg: context.command

                });
                delete gameRequests[context.channel.id];
            } else {
                context.sendLang("GAME_NO_INVITES", {arg: context.command});
            }
        },
        resign: function (context, bot) {
            const channel = context.channel.id;
            if (!runningGames[channel]) {
                context.sendLang("GAME_NOT_RUNNING", {arg: context.command});
            } else if (runningGames[channel].players[+runningGames[channel].turn].id !== context.user.id) {
                context.sendLang("GAME_NO_RESIGN", {arg: context.command});
            } else {
                context.sendLang("GAME_RESIGN", {
                    user: context.user.id,
                    winner: runningGames[channel].players[+!runningGames[channel].turn].id
                });
            }
            delete runningGames[context.channel.id];
        },
        notation: function (context) {
            return context.sendLang({content: "CHESS_NOTATION", ephemeral: true});
        }
    }
};

