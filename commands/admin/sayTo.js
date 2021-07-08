module.exports = {
    name: "Say To",
    usage: "say :channel :message+",
    commands: ["sayto"],
    run: async function (context, bot) {
        const content = context.options.message
        const target = await bot.client.channels.fetch(context.options.channel);
        if (target) {
            await target.send(content);
            return context.send("Sent");
        }
        return context.send("Could not find target.");
    }
};