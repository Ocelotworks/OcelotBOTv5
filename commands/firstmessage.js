module.exports = {
    name: "Get First Message",
    usage: "firstmessage",
    categories: ["tools"],
    detailedHelp: "Get a link to the first message in this channel.",
    commands: ["firstmessage"],
    run: async function run(message) {
        message.channel.send(`Click here for the first message in the channel: https://discord.com/channels/${message.guild ? message.guild.id : "@me"}/${message.channel.id}/0`)
    },
};

