module.exports = {
    name: "Reload Ban List",
    usage: "reloadbans",
    commands: ["reloadbans"],
    run: async function(message, args, bot){
        let sentMessage = await message.channel.send("Reloading Ban Cache...");
        await bot.banCache.update();
        sentMessage.edit(`Reloaded Ban Cache:\n${bot.banCache.user.length} banned users\n${bot.banCache.channel.length} banned channels\n${bot.banCache.server.length} banned servers`)
    }
};