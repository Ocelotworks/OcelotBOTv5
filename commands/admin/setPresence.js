module.exports = {
    name: "Set Presence",
    usage: "setPresence [clear?:clear] :message+",
    commands: ["setpresence", "presence"],
    run: async function (context, bot) {
        bot.presenceMessage = context.options.message
        await bot.rabbit.event({type: "presence", payload: bot.presenceMessage})
        if(context.options.message)
            return context.send(`Set presence to \`${context.options.message}\``);
        return context.send("Cleared presence message.");
    }
};