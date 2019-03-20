/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 17/03/2019
 * ╚════ ║   (ocelotbotv5) zalgo
 *  ════╝
 */
module.exports = {
    name: "Zalgo Text",
    usage: "zalgo <text>",
    commands: ["zalgo"],
    categories: ["fun"],
    run: async function(message, args, bot){
        if(!args[1])
            return message.channel.send(":bangbang: You must enter some text!");
        message.channel.send(message.cleanContent.substring(args[0].length+1).zalgo);
    }
};