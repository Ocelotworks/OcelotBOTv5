/**
 *   ╔════   Copyright 2018 Peter Maguire
 *  ║ ════╗  Created 27/11/2018
 * ╚════ ║   (ocelotbotv5) nickname
 *  ════╝
 */
const nicknames = [
    "mom", "dad", "mommy", "a series of tubes", "dank memer", "not dank memer", "foreskin", "thot", "thot patrol", "big tiddy goth gf", "your new nickname",
    "butt", "ecksdee", "Grinch", "ho ho ho", "everyone", "here", "Ed, Edd & Eddy", "several people", "is typing", "vore my ass", "daddy", "OcelotBOT", "not ocelotbot",
    "better than ocelotbot", "spook", "gods mistake", "sexy and i know it", "lvl 100 mafia boss", "forkknife", "owl city", "lady pickle", "(:", ":)", "oh no", "ocelotbot number 1 fan",
    "spooky", "big chungus", "[Object object]", "Pussy Poppin Pirate", "Peter Griffin", "Stooey", "Post-nut Clarity", "Engorged", "Asshole First Class", "Cyberspunk 2069", "Something Went Wrong.",
    "banned", "ban me", "big sad", "Eating Ass Masterclass", "Welcome to the Cum Zone", "In Love with Pain", "bottom boy", "Elon's Musk", "sans undertale",
];
module.exports = {
    name: "New Nickname Generator",
    usage: "newnick",
    categories: ["tools", "fun"],
    rateLimit: 10,
    commands: ["newnick", "newnickname"],
    requiredPermissions: ["MANAGE_NICKNAMES"],
    unwholesome: true,
    run: async function run(context, bot) {
        if (!context.member)
            return context.replyLang("GENERIC_DM_CHANNEL");

        let oldNickname = context.nickname;
        try {
            await context.member.setNickname(bot.util.arrayRand(nicknames), "!newnick command");
            context.send("Enjoy your new nickname (:");
            if (oldNickname && nicknames.indexOf(oldNickname) === -1 && !context.getBool("privacy.serverAnonymous")) {
                nicknames.push(oldNickname);
                bot.logger.log("Adding " + oldNickname + " to the pile");
            }
        } catch (e) {
            bot.logger.log(e);
            context.send("Unable to set nickname. This could be because you are higher in the role list than OcelotBOT.");
        }
    }
};