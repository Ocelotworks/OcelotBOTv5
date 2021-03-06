module.exports = {
    name: "Spook Stats",
    usage: "spook",
    commands: ["spook"],
    run: async function (message, args, bot) {
        const result = await bot.database.getSpookedServers();
        message.channel.send(`${result.total[0]['COUNT(*)']} total spooks in ${result.servers.length} unique servers`);
    }
};