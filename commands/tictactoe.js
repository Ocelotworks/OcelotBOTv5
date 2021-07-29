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
        bot.interactions.addHandler("#", async (interaction)=>{
            // Get the interaction data and validate that the user is supposed to be clicking this
            const [turnUser, otherUser, gridPosition, turnType] = interaction.data.custom_id.substring(1).split("|");
            if(turnUser !== interaction.member.user.id && otherUser !== interaction.member.user.id)
                return {type: 4, data: {flags: 64, content: "You are not a participant in this game of Tic Tac Toe!"}}

            if(turnUser !== interaction.member.user.id)
                return {type: 4, data: {flags: 64, content: "It's currently the other players turn."}}


            const nextTurn = turnType === X ? O : X;
            const x = Math.floor(gridPosition/3)
            const y = gridPosition % 3;

            // Set the current grid position
            interaction.message.components[x].components[y] = {
                type: 2,
                style: buttonStyle,
                disabled: true,
                emoji: {name: turnType},
                custom_id: `#${otherUser}|${turnUser}|${gridPosition}|${nextTurn}`
            }

            let content = `${X}: <@${turnType === X ? turnUser : otherUser}>\n${O}: <@${turnType === O ? turnUser : otherUser}>\n`;

            // Switch the user and turn type for the rest of the buttons
            interaction.message.components.forEach((c) => c.components.forEach((c) => {
                console.log(c);
                const [turnUser, otherUser, gridPosition, turnType] = c.custom_id.substring(1).split("|");
                c.custom_id = `#${otherUser}|${turnUser}|${gridPosition}|${turnType === X ? O : X}`
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
                    if(winner !== "draw" && winner.find((a)=>a[0] === x && a[1] === y))c.style = 1;
                }))
            }else{
                content += `Current Turn: ${nextTurn}`
            }

            // Send the message
            const channel = await bot.client.channels.fetch(interaction.message.channel_id);
            let api = new Discord.MessagePayload(channel, {});
            api.data = {content, components: interaction.message.components};
            let message = await channel.messages.fetch(interaction.message.id);
            message.edit(api);
            return {type: 6};
        })
    },
    run: function run(context){
        // Why do you make me do these things
        const opponent = (context.channel.guildMembers || context.channel.members).get(context.options.user);
        if(!opponent)return context.send({content: "Couldn't find that user. Make sure that they're able to view this channel.", ephemeral: true});
        if(opponent.bot)return context.send({content: `You can't play tic tac toe against a bot.`, ephemeral: true});
        const row = (r)=>[
            {type: 2, style: buttonStyle, label: " ", custom_id: `#${context.user.id}|${opponent.id}|${r+0}|${X}`},
            {type: 2, style: buttonStyle, label: " ", custom_id: `#${context.user.id}|${opponent.id}|${r+1}|${X}`},
            {type: 2, style: buttonStyle, label: " ", custom_id: `#${context.user.id}|${opponent.id}|${r+2}|${X}`}
        ];
        let api = new Discord.MessagePayload(context.channel, {});
        api.data = {
            content: `${X}: ${context.user}\n${O}: ${opponent}\nCurrent Turn: ${O}`,
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

