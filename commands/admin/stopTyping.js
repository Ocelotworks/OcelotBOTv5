module.exports = {
    name: "Force Stop Typing",
    usage: "stoptyping",
    commands: ["stoptyping"],
    slashHidden: true,
    run: function (context, bot) {
        context.channel.stopTyping(true);
    }
};