/**
 *   ╔════   Copyright 2018 Peter Maguire
 *  ║ ════╗  Created 27/11/2018
 * ╚════ ║   (ocelotbotv5) nickname
 *  ════╝
 */


const nicknames = [
    "mom", "dad", "mommy", "a series of tubes", "dank memer", "not dank memer", "foreskin", "thot", "thot patrol", "big tiddy goth gf", "your new nickname",
    "butt", "ecksdee", "Grinch", "ho ho ho", "everyone", "here", "Ed, Edd & Eddy", "several people", "is typing", "vore my ass", "daddy",
    "better than ocelotbot", "spook", "gods mistake", "sexy and i know it", "forkknife", "owl city", "lady pickle", "(:", ":)", "ocelotbot number 1 fan",
    "spooky", "big chungus", "[Object object]", "Pussy Poppin Pirate", "Peter Griffin", "Stooey", "Post-nut Clarity", "Engorged", "Asshole First Class", "Cyberspunk 2069", "Something Went Wrong.",
    "banned", "ban me", "Eating Ass Masterclass", "Welcome to the Cum Zone", "In Love with Pain", "bottom boy", "Elon's Musk", "sans undertale",
    [["Mr", "Mrs", "Sir", "Sgt", "", "Big"], ["", "poopy", "pee-pee", "big","fart","small","ass"], ["ass","butthole", "hole", "bash", "basher", "smasher", "thiccboi", "chungus", "P"]],
    [["the", ""], ["cardboard","living","binary","enraged","chief","","iron","bronze","gold","silver","shit","fart"], ["box","house","room","chungus","vegetable","thief","king","chief"]],
    [["not","", "ban"], ["username", "randUsername", "Big P", "OcelotBOT", "Dank Memer", "Peter Griffin"]],
    [["username", "randUsername", "Big P", "OcelotBOT", "Dank Memer", "Peter Griffin"], ["lover", "hater", "stalker", "bitch", "in disguise"]],
    ["Welcome to the", ["cum","fart","dick","gay","weirdo","normie"], "zone"],
    [["Substantial", "Large", "Big", "Massive", "Tiny", "Small"], ["Homie", "Chungus", "Lad", "Lass", "Homeboy", "Kid", "Dude", "Sad", "Happy"]],
    ["Only",["cum", "jizz", "spunk","jerk"],["inside", "to", "onto"], ["anime girls", "anime boys", "myself"]],
    ["double jointed", ["", "pussy", "leg", "arm", "head", "penis"]],
    [["fresh", "dirty", "clean"], ["balls", "head", "brain", "mind"]],
    ["I", ["regularly", "once", "sometimes", "have", "kinda", ""], ["fucked", "shagged", "slapped", "fed", "beat"], "a", ["horse", "duck", "man", "woman", "stranger"], ["", "to death"]],
    ["First the", ["kiss", "cum"], "then the", ["kiss", "cum"]],
    [["My Dick is", "My Mind is", "I am"], ["in love with", "experiencing"], ["pain", "pleasure"]],
    ["There's a", ["snake", "horse", "foot", "stash", "cock"], "in my", ["ass", "stomach", "boot", "hat", "basement"]],
    ["oh", ["no", "yes"]],
    ["lvl", ["100", "0", "50", "69", "420"], "mafia boss"]

]
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
            await context.member.setNickname(generateNickname(bot, context), "!newnick command");
            context.send("Enjoy your new nickname (:");
            if (oldNickname && nicknames.indexOf(oldNickname) === -1 && !context.getBool("privacy.serverAnonymous")) {
                nicknames[0].push(oldNickname);
                bot.logger.log("Adding " + oldNickname + " to the pile");
            }
        } catch (e) {
            bot.logger.log(e);
            context.send("Unable to set nickname. This could be because you are higher in the role list than OcelotBOT.");
        }
    }
};


function generateNickname(bot, context){
    let root = bot.util.arrayRand(nicknames);
    if(typeof root === "string"){
        return root;
    }
    let output = "";
    for(let i = 0; i < root.length; i++){
        const piece = root[i];
        if(i > 0)
            output += " ";
        if(typeof piece == "string"){
            output += piece;
        }else {
            output += bot.util.arrayRand(piece)
        }

    }
    output = output.replace(/username/g, context.user.username);
    output = output.replace(/randUsername/g, context.channel.members.random().username);
    return output.substring(0, 32);
}