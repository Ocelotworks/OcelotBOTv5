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
                output += `${list[i].name}:: ${/*bot.prefixCache[message.guild.id] || */"!"}${list[i].usage}\n`
        }
        message.editLang("COMMANDS", output);
    },
    run: async function run(message, args, bot){
        const permissions = await message.channel.permissionsFor(bot.client.user);
        if(permissions.has(["ADD_REACTIONS", "MANAGE_MESSAGES"])){
            let embed = new Discord.RichEmbed();
            embed.setTitle("OcelotBOT Commands");
            embed.setDescription("Select a category from the list below");
            let count = 0;
            for(let i in bot.commandCategories){
                embed.addField(`${i.toUpperCase()}:`, `React with ${numbers[count]}`, true);
                count++;
            }
            let sentMessage = await message.channel.send("", embed);
            const keys = Object.keys(bot.commandCategories);
            sentMessage.awaitReactions(function(reaction, user){
                if(user.id === bot.client.user.id)return false;

                let num = parseInt(reaction.emoji.name[0]);
                if(isNaN(num))return false;
                num--;
                if(!keys[num])return false;

                module.exports.showHelpFor(bot.commandCategories[keys[num]], sentMessage);
                reaction.remove(user);

                return false;
            }, {time: 120000}, function reactionEnd(){
                bot.logger.log("Reactions expired on !help");
                sentMessage.clearReactions();
            });

            for(let j = 0; j < count; j++){
                await sentMessage.react(numbers[j]);
            }

        }else{
            let unique = []; //ahhh..
            let output = "";
            let commandUsages = bot.commandUsages;
            if(args[1] && Object.keys(bot.commandCategories).indexOf(args[1].toLowerCase()) > -1){
                commandUsages = bot.commandCategories[args[1].toLowerCase()];
            }
            for(let i in commandUsages){
                if(commandUsages.hasOwnProperty(i) && !commandUsages[i].hidden)
                    if(unique.indexOf(commandUsages[i].name) === -1) {
                        unique.push(commandUsages[i].name);
                        output += /*`${commandUsages[i].name}::*/`${/*bot.prefixCache[message.guild.id] || */"!"}${commandUsages[i].usage}\n`
                    }
            }
            message.replyLang("COMMANDS", output);
        }
    }
};