module.exports = {
    name: "Set Presence",
    usage: "setPresence [message]",
    commands: ["setpresence"],
    run:  async function(message, args, bot){
        bot.presenceMessage = args[3] === "clear" ? null : message.content.substring(message.content.indexOf(args[2]));
        return bot.rabbit.event({type: "presence", payload: bot.presenceMessage})
    }
};