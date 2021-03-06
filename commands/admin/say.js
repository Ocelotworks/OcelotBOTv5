module.exports = {
    name: "Say",
    usage: "say",
    commands: ["say"],
    run: function (message, args, bot) {
        message.channel.send(message.content.substring(message.content.indexOf(args[2])));
    }
};