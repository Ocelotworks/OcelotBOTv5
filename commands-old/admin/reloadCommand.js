/**
 * Created by Peter on 03/07/2017.
 */
module.exports = {
    id: "reloadCommand",
    run: function run(user, userID, channel, message, args, event, bot, recv){
        try {
            const path = __dirname+"/../"+args[2];
            var loaded = false;
            bot.util.uncache(path, function () {
                if(!loaded) {
                    var loadedCommand = require(path);
                    recv.sendMessage({
                        to: channel,
                        message: `Loaded command ${loadedCommand.name}`
                    });
                    bot.commandUsages[loadedCommand.name] = {
                        usage: loadedCommand.usage,
                        accessLevel: loadedCommand.accessLevel
                    };
                    for (var i in loadedCommand.commands) {
                        if (loadedCommand.commands.hasOwnProperty(i)) {
                            bot.commands[loadedCommand.commands[i]] = loadedCommand.run;
                        }
                    }
                    loaded = true;
                }
            });
        }catch(e){
            recv.sendMessage({
                to: channel,
                message: e.stack
            });
        }
    }
};