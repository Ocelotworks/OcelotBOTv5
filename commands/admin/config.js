const config = require('config');
module.exports = {
    name: "Config",
    usage: "config <key>",
    commands: ["config"],
    run:  function(message, args, bot){
        message.channel.send(`\`${config.get(args[2])}\``);
    }
};