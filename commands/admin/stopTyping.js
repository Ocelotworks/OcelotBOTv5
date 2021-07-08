module.exports = {
    name: "Force Stop Typing",
    usage: "stoptyping",
    commands: ["stoptyping"],
    run: function (context, bot) {
        context.channel.stopTyping(true);
    }
};