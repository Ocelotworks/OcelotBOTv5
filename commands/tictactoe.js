const Discord = require('discord.js');
const X = "❌";
const O = "⭕";
const buttonStyle = 2;
module.exports = {
    name: "Tic Tac Toe",
    usage: "tictactoe :@user",
    accessLevel: 0,
    commands: ["tictactoe", "noughtsandcrosses", "ttt"],
    categories: ["games", "fun"],
    init: function(bot){
        bot.interactions.addHandler("#", async (interaction, context)=>{
            // Get the interaction data and validate that the user is supposed to be clicking this
            const [turnUser, otherUser, gridPosition, turnType] = interaction.customId.substring(1).split("|");
            if(turnUser !== interaction.user.id && otherUser !== interaction.user.id)
                return context.sendLang({content: "TTT_NOT_PARTICIPANT", ephemeral: true});

            if(turnUser !== interaction.member.user.id)
                return context.sendLang({content: "TTT_NOT_TURN", ephemeral: true});


            const nextTurn = turnType === X ? O : X;
            const x = Math.floor(gridPosition/3)
            const y = gridPosition % 3;

            // Set the current grid position
            interaction.message.components[x].components[y].disabled = true;
            interaction.message.components[x].components[y].emoji = {name: turnType};

            let content = `${X}: <@${turnType === X ? turnUser : otherUser}>\n${O}: <@${turnType === O ? turnUser : otherUser}>\n`;

            // Switch the user and turn type for the rest of the buttons
            interaction.message.components.forEach((c) => c.components.forEach((c) => {
                const [turnUser, otherUser, gridPosition, turnType] = c.customId.substring(1).split("|");
                c.customId = `#${otherUser}|${turnUser}|${gridPosition}|${turnType === X ? O : X}`
            }))

            const winner = getWin(interaction.message.components);
            if (winner) {
                if(winner === "draw"){
                    content += `:rainbow: It's a draw! Everyone wins.`;
                }else {
                    content += `Game over. **${getType(interaction.message.components[winner[0][0]].components[winner[0][1]])} wins!**`
                }
                interaction.message.components.forEach((c, x) => c.components.forEach((c, y) => {
                    c.disabled = true
                    if(winner !== "draw" && winner.find((a)=>a[0] === x && a[1] === y))c.style = "PRIMARY";
                }))
            }else{
                content += `Current Turn: ${nextTurn}`
            }

            return context.edit({content, components: interaction.message.components});
        })
    },
    run: async function run(context){
        // Why do you make me do these things
        const opponent = (await context.getMember(context.options.user))?.user;
        if(!opponent)return context.send({content: "Couldn't find that user. Make sure that they're able to view this channel.", ephemeral: true});
        if(opponent.bot)return context.send({content: `You can't play tic tac toe against a bot.`, ephemeral: true});
        const row = (r)=>[
            {type: 2, style: buttonStyle, label: " ", custom_id: `#${context.user.id}|${opponent.id}|${r+0}|${X}`},
            {type: 2, style: buttonStyle, label: " ", custom_id: `#${context.user.id}|${opponent.id}|${r+1}|${X}`},
            {type: 2, style: buttonStyle, label: " ", custom_id: `#${context.user.id}|${opponent.id}|${r+2}|${X}`}
        ];
        let api = new Discord.MessagePayload(context.channel, {});
        api.data = {
            content: `${X}: ${context.user}\n${O}: ${opponent}\nCurrent Turn: ${X}`,
            components: [
                {type: 1, components: row(0)},
                {type: 1, components: row(3)},
                {type: 1, components: row(6),}
            ]
        }
        return context.send(api);
    },
};


function getWin(board){
    for(let i = 0; i < 3; i++){
        // Horizontal
        if(getType(board[i].components[0]) !== " " &&
            getType(board[i].components[0]) === getType(board[i].components[1]) &&
            getType(board[i].components[1]) === getType(board[i].components[2]))return [[i,0],[i,1],[i,2]];
        // Vertical
        if(getType(board[0].components[i]) !== " " &&
            getType(board[0].components[i]) === getType(board[1].components[i]) &&
            getType(board[1].components[i]) === getType(board[2].components[i]))return [[0,i],[1,i],[2,i]];
    }
    // Diagonal
    if(getType(board[0].components[0]) !== " " &&
        getType(board[0].components[0]) === getType(board[1].components[1]) &&
        getType(board[1].components[1]) === getType(board[2].components[2]))return [[0,0],[1,1],[2,2]];
    if(getType(board[2].components[0]) !== " " &&
        getType(board[2].components[0]) === getType(board[1].components[1]) &&
        getType(board[1].components[1]) === getType(board[0].components[2]))return [[2,0],[1,1],[0,2]];
    if(!board.find((c)=>c.components.find((c)=>c.label === " ")))return "draw";
    return null;
}

function getType(button){
    if(!button.emoji)return button.label;
    return button.emoji.name;
}

