module.exports = {
    name: "Say To",
    usage: "say channel <message>",
    commands: ["sayto"],
    run: async function(message, args, bot){
        const content = message.content.substring(args[0].length+args[1].length+args[2].length+3);
        const target = await bot.client.channels.fetch(args[2]);
        if (target) {
            await target.send(content);
        }
        message.channel.send("Sent");
    }
};