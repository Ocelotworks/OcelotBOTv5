/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 08/04/2019
 * ╚════ ║   (ocelotbotv5) edgy
 *  ════╝
 */
module.exports = {
    name: "Edgy Text",
    usage: "edgy <text>",
    commands: ["edgy"],
    categories: ["text"],
    run: async function(message, args, bot){
        if(!args[1])
            return message.channel.send(":bangbang: You must enter some text!");
        message.channel.send(message.cleanContent.substring(args[0].length+1).trap);
    }
};