module.exports = {
    name: "Prefix Idiotproofing",
    hidden: true,
    usage: "prefix",
    commands: ["prefix", "setprefix", "prefixset"],
    run: async function (message, args) {
        message.channel.send(`To set the prefix, type **${context.command} set prefix %**, where % is the prefix that you want.`)
    }
};