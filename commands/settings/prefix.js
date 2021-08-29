module.exports = {
    name: "Prefix Idiotproofing",
    hidden: true,
    usage: "prefix",
    commands: ["prefix", "setprefix", "prefixset"],
    run: async function (context, bot) {
        return context.send({content: `To set the prefix, type **${context.getSetting("prefix")}${context.command} set prefix %**, where % is the prefix that you want.`, ephemeral: true})
    }
};