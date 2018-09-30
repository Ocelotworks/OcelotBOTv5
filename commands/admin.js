const fs = require('fs');
module.exports = {
    name: "Admin",
    usage: "admin",
    categories: ["tools"],
    commands: ["admin", "adm", "mgt"],
    init: function init(bot){
        bot.logger.log("Loading admin commands...");
        fs.readdir("commands/admin", function loadAdminCommands(err, files){
           if(err){
               bot.raven.captureException(err);
               bot.logger.log("Unable to read admin command dir");
           }else{
               for(let i = 0; i < files.length; i++){
                   try{
                       const command = require(`./admin/${files[i]}`);
                       bot.logger.log(`Loaded admin command ${command.name}`);
                       for(let c = 0; c < command.commands.length; c++){
                           module.exports.subCommands[command.commands[c]] = command;
                           if(command.init){
                               bot.logger.log(`Performing init for admin command ${command.name}`);
                               command.init(bot);
                           }
                       }
                   }catch(e){
                       bot.raven.captureException(err);
                       bot.logger.log(`Error loading ${files[i]}: ${e}`);
                   }
               }
           }
        });
    },
    run: function(message, args, bot){
        if(bot.admins.indexOf(message.author.id) === -1)return;
        if(args[1] && module.exports.subCommands[args[1].toLowerCase()]){
            module.exports.subCommands[args[1].toLowerCase()].run(message, args, bot);
        }else{
            let output = "Invalid usage. Available Commands:\n";
            for(let i in module.exports.subCommands){
                if(module.exports.subCommands.hasOwnProperty(i))
                    output += module.exports.subCommands[i].name+" - "+module.exports.subCommands[i].usage+"\n";
            }
            message.channel.send(output);
        }
    },
    subCommands: {}
};