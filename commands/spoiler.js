/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 27/02/2019
 * ╚════ ║   (ocelotbotv5) spoiler
 *  ════╝
 */
module.exports = {
    name: "Spoilerise Text",
    usage: "spoiler <text>",
    categories: ["fun"],
    rateLimit: 10,
    commands: ["spoiler", "spoilerise", "spoilerize"],
    run: function run(message, args) {
        if(!args[1]){
            message.channel.send("You must supply some text.");
        }else{
            message.channel.send(`||${[...message.cleanContent.substring(args[0].length+1)].join("||||")}||`)
        }
    }
};