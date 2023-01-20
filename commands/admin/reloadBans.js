module.exports = {
    name: "Reload Ban List",
    usage: "reloadbans",
    commands: ["reloadbans"],
    slashHidden: true,
    run: async function (context, bot) {
        bot.rabbit.event({type: "updateBans"})
        return context.send("Reloading Ban Cache...");
    }
};