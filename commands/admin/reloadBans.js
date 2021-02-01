module.exports = {
    name: "Reload Ban List",
    usage: "reloadbans",
    commands: ["reloadbans"],
    run: async function(message, args, bot){
        await message.channel.send("Reloading Ban Cache...");
        bot.rabbit.event({type: "updateBans"})
    }
};