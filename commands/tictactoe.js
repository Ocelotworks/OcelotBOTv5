let runningGames = {
    dummy: {
        turn: false,
        players: [1, 2],
        lastMessage: null,
        board: [
            [0,1,0],
            [null, null, null],
            [null, 1, null]
        ]
    }
};

let gameRequests = {
    dummy: {
        from: 10,
        to: 10,
        at: 0
    }
};

const cols = ["A", "B", "C"];
const pieces = ["X", "O", " "];

module.exports = {
    name: "Tic Tac Toe",
    usage: "tictactoe start <@player>/<grid position>",
    accessLevel: 0,
    commands: ["tictactoe", "noughtsandcrosses", "ttt"],
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
        }else if(runningGames[message.channel.id] && runningGames[message.channel.id].players[+runningGames[message.channel.id].turn].id === message.author.id && subCommand.match(/[abc][123]/i)) {
            const row = cols.indexOf(subCommand[0].toUpperCase());
            const col = subCommand[1]-1;
            module.exports.doGo(message, col, row, bot);
        }else{
            message.channel.send(`:bangbang: Invalid usage! To start a game type ${args[0]} start @player`);
        }

    },
    getWinner: function(message){
        const board = runningGames[message.channel.id].board;
        for(let i = 0; i < 3; i++){
            //hoz
            if(board[i][0] === board[i][1] && board[i][1] === board[i][2])return board[i][0];
            //vert
            if(board[0][i] === board[1][i] && board[1][i] === board[2][i])return board[0][i];
        }
        //diag
        if(board[0][0] === board[1][1] && board[1][1] === board[2][2])return board[0][0];
        if(board[2][0] === board[1][1] && board[1][1] === board[0][2])return board[2][0];
        return 2;
    },
    getDraw: function(message){
        const board = runningGames[message.channel.id].board;
        for(let x = 0; x < 3; x++){
            for(let y = 0; y < 3; y++){
                if(board[x][y] === 2)return false;
            }
        }
        return true;
    },
    doGo: async function(message, row, col, bot){
        const game = runningGames[message.channel.id];
        if(game.board[row][col] < 2){
            message.channel.send(":warning: That space is occupied. Try another space.");
        }else{
            game.board[row][col] = +game.turn;
            const winner = module.exports.getWinner(message);
            if(winner < 2){
                const winnerUser = game.players[winner];
                if(game.lastMessage)
                    game.lastMessage.delete();
                message.channel.send(`${winnerUser} wins!\n${module.exports.renderBoard(message.channel.id)}`);
                bot.tasks.endTask("tictactoe", message.channel.id);
                delete runningGames[message.channel.id];
            }else if(module.exports.getDraw(message)){
                message.channel.send(`Draw! Everyone wins! :rainbow: \n${module.exports.renderBoard(message.channel.id)}`);
                bot.tasks.endTask("tictactoe", message.channel.id);
                delete runningGames[message.channel.id];
            }else{
                game.turn = !game.turn;
                if(game.lastMessage)
                    game.lastMessage.delete();
                game.lastMessage = await message.channel.send(`${game.players[+game.turn]}, it is your turn:\n${module.exports.renderBoard(message.channel.id)}`);
            }
        }

    },
    renderBoard: function(channel){
        const game = runningGames[channel];
        const board =  game.board;
        const turn = game.turn;
        let output = "";
        if(!turn)output += `**${pieces[0]}: ${game.players[0].username}**\n${pieces[1]}: ${game.players[1].username}`;
        else output += `${pieces[0]}: ${game.players[0].username}\n**${pieces[1]}: ${game.players[1].username}**`;
        output +=
`\`\`\`
╔═══╦═══╦═══╦═══╗
║   ║ A ║ B ║ C ║
╠═══╬═══╬═══╬═══╣
║ 1 ║ ${pieces[board[0][0]]} ║ ${pieces[board[0][1]]} ║ ${pieces[board[0][2]]} ║
║ 2 ║ ${pieces[board[1][0]]} ║ ${pieces[board[1][1]]} ║ ${pieces[board[1][2]]} ║
║ 3 ║ ${pieces[board[2][0]]} ║ ${pieces[board[2][1]]} ║ ${pieces[board[2][2]]} ║
╚═══╩═══╩═══╩═══╝
\`\`\``;

        return output;
    },
    subCommands: {
        start: function(message, args, bot){
            const currentGame = runningGames[message.channel.id];
            const command = args[0];
            if(currentGame){
                const authorIndex =currentGame.players.indexOf(message.author.id);
                if(authorIndex === -1){
                    message.replyLang("GAME_ALREADY_RUNNING");
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
                    message.channel.send(`:rotating_light: ${target}, ${message.author} challenges you to a game of tic tac toe! Type **${args[0]} accept** to start!`);
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
                    board: [[2, 2, 2],[2, 2, 2],[2, 2, 2]],
                };
                bot.tasks.startTask("tictactoe", message.channel.id);
                runningGames[message.channel.id].lastMessage = await message.channel.send(`${request.from}, your request has been accepted! It is your turn.\n${module.exports.renderBoard(message.channel.id)}\nMove with ${args[0]} [position] i.e ${args[0]} B2 for the middle.`);
                delete gameRequests[message.channel.id];
            }else{
                message.channel.send(`:bangbang: You don't currently have any game invites. Type **${args[0]} start @user** to start one yourself.`);
            }
        }
    }
};

