/**
 *   ╔════   Copyright 2018 Peter Maguire
 *  ║ ════╗  Created 03/12/2018
 * ╚════ ║   (ocelotbotv5) clap
 *  ════╝
 */
module.exports = {
    name: "Clap Text",
    usage: "clap <text>",
    categories: ["fun", "memes", "tools"],
    rateLimit: 10,
    commands: ["clap", "claptext"],
    init: function(bot){
        bot.usedTopicalCompliments = [];
    },
    run: function run(message, args, bot) {
       if(!args[1]){
            message.channel.send("You must supply some text.");
       }else{
           message.channel.send(message.content.substring(message.content.indexOf(args[1])).replace(/ /g, "👏"))
       }
    }
};