/**
 *   ╔════   Copyright 2018 Peter Maguire
 *  ║ ════╗  Created 27/11/2018
 * ╚════ ║   (ocelotbotv5) nickname
 *  ════╝
 */
const nicknames = [
    "mom",
    "dad",
    "a series of tubes",
    "i wanna be tracer",
    "im allready tracer",
    "foreskin",
    "thot",
    "thot patrol",
    "big tiddy goth gf",
    "your new nickname",
    "they did surgery on a grape",
    "butt",
    "ecksdee",
    "Grinch",
    "ho ho ho",
    "everyone",
    "here",
    "Ed, Edd & Eddy",
    "several people",
    "is typing",
    "vore my ass",
    "daddy",
    "OcelotBOT"
];
module.exports = {
    name: "New Nickname Generator",
    usage: "newnick",
    categories: ["tools", "fun"],
    commands: ["newnick", "newnickname"],
    requiredPermissions: ["MANAGE_NICKNAMES"],
    run: async function run(message, args, bot) {
        if(message.member) {
            let oldNickname = message.member.nickname;
            try {
                await message.member.setNickname(bot.util.arrayRand(nicknames), "!newnick command");
                message.channel.send("Enjoy your new nickname (:");
                if(oldNickname && nicknames.indexOf(oldNickname) === -1) {

                    nicknames.push(oldNickname);
                    bot.logger.log("Adding " + oldNickname + " to the pile");
                }
            }catch(e){
                bot.logger.log(e);
                message.replyLang("GENERIC_ERROR");
            }

        }else{
            message.replyLang("GENERIC_DM_CHANNEL");
        }
    }
};