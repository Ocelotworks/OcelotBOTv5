/**
 * Created by Peter on 07/06/2017.
 */
const Discord = require('discord.js');
const numbers = [
    "1⃣", "2⃣", "3⃣", "4⃣","5⃣", "6⃣","7⃣", "8⃣", "9⃣"
];
module.exports = {
    name: "Help Command",
    usage: "help [command]",
    detailedHelp: "If you need help with the help command I can't help you.",
    commands: ["help", "commands"],
    categories: ["meta"],
    init: function init(bot){
        bot.bus.on("commandLoadFinished", function commandLoadFinished(){
            bot.logger.log("Generating help categories");
            bot.commandCategories = {};
            for(let i in bot.commandUsages){
                const commandUsage = bot.commandUsages[i];
                for(let j = 0; j < commandUsage.categories.length; j++){
                    const category = commandUsage.categories[j];
                    if(bot.commandCategories[category] && !bot.commandCategories[category][commandUsage.id]){
                        bot.commandCategories[category][commandUsage.id] = commandUsage;
                    }else if(!bot.commandCategories[category]){
                        bot.commandCategories[category] = {[commandUsage.id]: commandUsage};
                    }
                }
            }
        });
    },
    showHelpFor: function(list, message){
        let output = "";
        for(let i in list){
            if(list.hasOwnProperty(i) && !list[i].hidden)
                output += `${list[i].name}:: ${message.getSetting("prefix")}${list[i].usage}\n`
        }
        message.editLang("COMMANDS", output);
    },
    run: async function run(message, args, bot){

        if(!args[1]) {
            // let output = `\`\`\`python\n#Select a Category\n`;
            let output = "";

            for (let i in bot.commandCategories) {
                if (message.getSetting("help.hiddenCategories") && message.getSetting("help.hiddenCategories").indexOf(i) > -1)
                    continue;
                output += `For '${i}' use ${args[0]} ${i}\n`;
            }
            //output += "\n```";
            message.replyLang("COMMANDS_CATEGORIES", {
                categories: output
            });
            return;
        }
        const arg = args[1].toLowerCase();
        if(!bot.commandCategories[arg]){
            if(bot.commandUsages[arg]){
                let command = bot.commandUsages[arg];
                let output = `**${command.name} Help:**\n`;
                if(command.detailedHelp)
                    output += command.detailedHelp+"\n";
                output += `**Usage:** ${message.getSetting("prefix")}${command.usage}\n`;
                if(command.usageExample)
                    output += `**Example:** ${command.usageExample}\n`;

                message.channel.send(output);

            }else {
                message.replyLang("COMMANDS_INVALID_CATEGORY", {
                    arg: args[0]
                });
            }
        }else{
            let unique = []; //ahhh..
            let output = "";
            let commandUsages = bot.commandUsages;
            if(args[1] && Object.keys(bot.commandCategories).indexOf(arg) > -1){
                commandUsages = bot.commandCategories[arg];
            }
            for(let i in commandUsages){
                if(commandUsages.hasOwnProperty(i) && !commandUsages[i].hidden)
                    if(unique.indexOf(commandUsages[i].name) === -1) {
                        unique.push(commandUsages[i].name);
                        output += `${commandUsages[i].name}:: ${message.getSetting("prefix")}${commandUsages[i].usage}\n`
                    }
            }
            message.replyLang("COMMANDS", {commands: output});
        }
    }
};