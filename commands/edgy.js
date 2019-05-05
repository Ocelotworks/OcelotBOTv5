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
            return message.replyLang("GENERIC_TEXT", {command: args[0]});
        message.channel.send(message.cleanContent.substring(args[0].length+1).trap);
    }
};