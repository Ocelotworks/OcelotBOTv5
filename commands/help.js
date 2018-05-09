/**
 * Created by Peter on 07/06/2017.
 */
module.exports = {
    name: "Help Command",
    usage: "help [command]",
    commands: ["help", "commands"],
    run: async function run(message, args, bot){
        let unique = []; //ahhh..
        let output = "";
        for(let i in bot.commandUsages){
            if(bot.commandUsages.hasOwnProperty(i) && !bot.commandUsages[i].hidden)
                if(unique.indexOf(bot.commandUsages[i].name) === -1) {
                    unique.push(bot.commandUsages[i].name);
                    output += `${bot.commandUsages[i].name}:: ${/*bot.prefixCache[message.guild.id] || */"!"}${bot.commandUsages[i].usage}\n`
                }
        }
        message.replyLang("COMMANDS", output);
    }
};