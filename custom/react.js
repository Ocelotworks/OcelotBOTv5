module.exports = {
    type: "react",
    run: async function(message, response, bot){
        return message.react(response.emoji);
    }
}