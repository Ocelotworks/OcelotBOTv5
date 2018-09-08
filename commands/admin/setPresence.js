module.exports = {
    name: "Set Presence",
    usage: "setPresence [message]",
    commands: ["setpresence"],
    run:  function(message, args, bot){
       bot.presenceMessage = args[3] === "clear" ? null : message.content.indexOf(args[2]);
    }
};