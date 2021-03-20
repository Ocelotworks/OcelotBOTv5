module.exports = {
    type: "text",
    run: function(message, response, bot){
        return message.channel.send(response.content);
    }
}