module.exports = {
    name: "Disable Command",
    usage: "disablecommand <command>",
    commands: ["disablecommand"],
    run: function(message, args, bot){
        if(!args[2]){
            message.channel.send("Invalid usage: !admin disablecommand <number>");
        }else{
            delete bot.commandUsages[args[2]];
            delete bot.commands[args[2]];
            message.channel.send("Disabled "+args[2]+" on this shard only.");
        }
    }
};