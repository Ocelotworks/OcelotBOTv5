/**
 * Created by Peter on 08/06/2017.
 */
const config = require('config');
const fs = require('fs');
const async = require('async');
module.exports = {
    name: "Admin Command",
    usage: "admin",
    accessLevel: 10,
    commands: ["admin"],
    hidden: true,
    functions: [],
    init: function init(bot, cb){
        bot.logger.log("Loading admin commands...");
        fs.readdir("commands/admin", function(err, files){
           if(err){
                bot.raven.captureException(err);
                bot.logger.error(`Error loading admin commands: ${err.stack}`);
           } else{
               async.eachSeries(files, function(file, cb2){
                   try {
                        var command = require(`./admin/${file}`);
                        module.exports.functions[command.id.toLowerCase()] = command.run;
                        bot.logger.log(`Loaded Admin Command ${command.id}`);
                   }catch(e){
                        bot.raven.captureException(e);
                        bot.logger.error(e.stack);
                   }finally{
                       cb2();
                   }
               });
           }
        });
        cb();
    },
    run: function run(user, userID, channel, message, args, event, bot, recv, debug, server){
        //noinspection EqualityComparisonWithCoercionJS
        if(userID == "139871249567318017"){
            if(args[1] && module.exports.functions[args[1].toLowerCase()]){
                module.exports.functions[args[1].toLowerCase()](user, userID, channel, message, args, event, bot, recv, debug, server);
            }else{
                recv.sendMessage({
                    to: channel,
                    message: `:bangbang: Invalid usage. !admin ${Object.keys(module.exports.functions).join("/")}`
                });
            }
        }

    }
};
