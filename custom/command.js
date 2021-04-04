module.exports = {
    type: "command",
    run: function(message, response, bot){
        // Garbage in, Garbage out
        const syntheticMessage = Object.assign(Object.create(Object.getPrototypeOf(message)), message);
        syntheticMessage.synthetic = true;
        syntheticMessage.content = response.content;
        syntheticMessage.cleanContent = response.content;
        return bot.runCommand(syntheticMessage)
    }
}