module.exports = {
    name: "Say",
    usage: "say :message+",
    commands: ["say"],
    run: function (context) {
        return context.send(context.options.message);
    }
};