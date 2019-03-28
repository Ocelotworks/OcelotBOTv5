/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 23/03/2019
 * ╚════ ║   (ocelotbotv5) set
 *  ════╝
 */
module.exports = {
    name: "Set Setting",
    usage: "set <setting> <value>",
    commands: ["set"],
    run: async function(message, args, bot, data){
        if(args[2] && data.settings[args[2].toLowerCase()]){
            data.settings[args[2].toLowerCase()].onSet(message, args, bot);
        }else{
            message.channel.send(`:bangbang: Invalid usage. Try ${args[0]} list`);
        }
    }
};