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
    detailedHelp: "Makes the text look all edgy like",
    usageExample: "edgy i can't drown my demons they know how to swim",
    responseExample: "༏ ©ΛΠŁ ƊɌѺШΠ ൩Ӌ Ðξ൩Øŋ§ ͳӇƎӋ Ҡŋ۝Ѽ Ԋ๏൰ ͳם ϟѼ༏Ԡ",
    categories: ["text"],
    run: async function(message, args, bot){
        if(!args[1])
            return message.replyLang("GENERIC_TEXT", {command: args[0]});
        message.channel.send(message.cleanContent.substring(args[0].length+1).trap);
    }
};