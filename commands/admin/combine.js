module.exports = {
    name: "Combine commands",
    usage: "combine command<br>command<br>command",
    commands: ["combine"],
    run: async function(message, args, bot){
        let commands = args.slice(2).join(" ").split("\n");
        message.channel.send(`Running ${commands.length} commands`);
        for(let i = 0; i < commands.length; i++){
            let command = commands[i];
            let args = command.split(" ");
            if(args[0].startsWith(message.getSetting("prefix")))
                args[0] = args[0].substring(message.getSetting("prefix").length);

            if(bot.commands[args[0]]){
                let fakeMessage = message;
                fakeMessage.content = command;
                await bot.commands[args[0]](fakeMessage, args, bot);
            }
        }
    }
};