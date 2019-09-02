/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 02/09/2019
 * ╚════ ║   (ocelotbotv5) eval
 *  ════╝
 */
module.exports = {
    name: "Admin Eval",
    usage: "eval <code>",
    commands: ["eval"],
    hidden: true,
    run: async function (message, args, bot, music) {
       if(bot.admins.indexOf(message.author.id) === -1)return;

       let term = message.cleanContent.substring(args[0].length+args[1].length+2).trim();
       try {
           message.channel.send("```\n"+JSON.stringify(eval(term))+"\n```");
       }catch(e){
           message.channel.send("```\n"+e+"\n```");
       }
    }
};