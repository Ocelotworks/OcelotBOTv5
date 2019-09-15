/**
 *   ╔════   Copyright 2018 Peter Maguire
 *  ║ ════╗  Created 27/11/2018
 * ╚════ ║   (ocelotbotv5) nickname
 *  ════╝
 */
const nicknames = [
    "mom",
    "dad",
    "mommy",
    "a series of tubes",
    "dank memer",
    "not dank memer",
    "foreskin",
    "thot",
    "thot patrol",
    "big tiddy goth gf",
    "your new nickname",
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
    "OcelotBOT",
    "better than ocelotbot",
    "spook",
    "gods mistake",
    "sexy and i know it",
    "lvl 100 mafia boss",
    "forkknife",
    "owl city",
    "lady pickle",
    "(:",
    ":)",
    "oh no",
    "ocelotbot number 1 fan",
    "spooky",
    "big chungus",
    "Something went wrong, try again later."
];
module.exports = {
    name: "New Nickname Generator",
    usage: "newnick",
    categories: ["tools", "fun"],
    rateLimit: 10,
    commands: ["newnick", "newnickname"],
    requiredPermissions: ["MANAGE_NICKNAMES"],
    unwholesome: true,
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