/**
 * Created by Peter on 07/06/2017.
 */
module.exports = {
    name: "Help Command",
    usage: "help [command]",
    accessLevel: 0,
    commands: ["help", "commands"],
    run: async function run(user, userID, channel, message, args, event, bot, recv, debug, server){
       if(message.length > 10){ bot.logger.log("Blocked help that is probably from a bot "+message.length); return;}
       var output =  await bot.lang.getTranslation(server, "COMMANDS")+":\n";
        for(var i in bot.commandUsages){
            if(bot.commandUsages.hasOwnProperty(i) && !bot.commandUsages[i].hidden && (!bot.commandUsages[i].receivers || bot.commandUsages[i].receivers.indexOf(recv.id) > -1))
                output += `**${i}** - ${bot.prefixCache[server] || "!"}${bot.commandUsages[i].usage}\n`
        }

        recv.sendMessage({
            to: channel,
            message: output
        });
    }
};