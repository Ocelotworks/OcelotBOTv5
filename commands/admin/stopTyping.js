module.exports = {
    name: "Force Stop Typing",
    usage: "stoptyping",
    commands: ["stoptyping"],
    run:  function(message, args, bot){
        message.channel.stopTyping(true);
    }
};