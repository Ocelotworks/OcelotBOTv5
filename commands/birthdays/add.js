/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 07/09/2019
 * ╚════ ║   (ocelotbotv5) add
 *  ════╝
 */
const chrono = require('chrono-node');
module.exports = {
    name: "Add Birthday",
    usage: "add @user date" ,
    commands: ["add", "new"],
    run: async function(message, args, bot){
        let target = message.author;
        if(message.mentions.users.size > 0)
            target = message.mentions.users.first();
        let date = chrono.parseDate(message.content);
        if(!date)
            return message.channel.send(`You need to enter a date, e.g **${args[0]} ${args[1]} add ${bot.client.user} 19th January**`);
        try{
            await bot.database.addBirthday(target.id, message.guild.id, date);
            message.channel.send(":tada: Birthday added!");
        }catch(e){
            console.error(e);
        }
    }
};