/**
 *   ╔════   Copyright 2018 Peter Maguire
 *  ║ ════╗  Created 27/11/2018
 * ╚════ ║   (ocelotbotv5) nickname
 *  ════╝
 */


const nicknames = [
    "mom", "dad", "mommy", ["a", ["string", "chain"], "of", ["tubes", "pipes", "boobs", "riddles"]], "dank memer", "not dank memer", "foreskin",
    "thot", "thot patrol", "big tiddy goth gf", "your new nickname", "butt", "ecksdee", "Grinch", "ho ho ho", "everyone", "here",
    "Ed, Edd & Eddy", "several people", "is typing", "vore my ass", "daddy", "arthur", "better than ocelotbot", "spook", "gods mistake",
    "sexy and i know it", "forkknife", "owl city", "(:", ":)", "ocelotbot number 1 fan", "spooky", "big chungus", "[Object object]", "Peter Griffin", "Stooey",
    "Engorged", "Cyberspunk 2069", "Something Went Wrong.", "free willy", "banned", "Eating Ass Masterclass", "In Love with Pain", "bottom boy", "Elon's Musk",
    "sans undertale", "nicole", "simp", "baby whale", "womb raider", "Bingus", "billie's eyelash", "shaquille oatmeal", ["noodle", ["daddy", "mummy", "mommy", "father"]],
    "my dad left me", "gucci gang", "dorito overlord", "queef latina", "Fedora The Explorer", "Ariana Grandes Ponytail", "Bud Lightyear", "bitch lasagna", "MILF Slayer",
    "urethra franklin", "hairy poppins", "Pawnee Goddess", "Chris P. Bacon", "Lt. Dan's Legs", "moms spaghetti", ["a", ["collection", "ball", "lump", "group"], "of cells"],
    [["cage", "rage"], ["quitter", "shitter"]], [["burger", "borger"],"queen"], "ChickyChickyParmParm", "lizzo's flute", "llama del ray", "reese witherfork",
    "destiny's grandchild", ["i", ["send", "sent"], ["feet", "dick", "butthole"], ["pics", "vids"]], "bill nye the russian spy",
    [["wife", "husband", "girlfriend", "boyfriend"], "material"], ["crazy", ["ex-girlfriend", "ex-boyfriend"]], "home wrecker", "stacy's mom", "rejected bachelor contestant", "delicious tyson anytizers",
    [["chlamydia", "herpes", "lawsuit"],"free since", ["'03", "'93", "'83"]], ["Welcome to the", ["Cum", "Spunk"], "Zone"], ["Post-nut", ["Clarity", "Shame"]],
    ["Asshole",["First", "Second", "Third", "Business"], "Class"], [["lady", "man", "boy"], "pickle"], [["Pussy", "Penis"], ["Poppin", "Poopin"], "Pirate"],
    [["Mr", "Mrs", "Sir", "Sgt", "", "Big"], ["", "poopy", "pee-pee", "big","fart","small","ass"], ["ass","butthole", "hole", "bash", "basher", "smasher", "thiccboi", "chungus", "P"]],
    [["the", ""], ["cardboard","living","binary","enraged","chief","","iron","bronze","gold","silver","shit","fart"], ["box","house","room","chungus","vegetable","thief","king","chief"]],
    [["not","", "ban"], ["username", "randUsername", "Big P", "OcelotBOT", "Dank Memer", "Peter Griffin"]],
    [["username", "randUsername", "Big P", "OcelotBOT", "Dank Memer", "Peter Griffin"], ["simp", "lover", "hater", "stalker", "bitch", "in disguise", "alt"]],
    ["Welcome to the", ["cum","fart","dick","gay","weirdo","normie"], "zone"],
    [["Substantial", "Large", "Big", "Massive", "Tiny", "Small"], ["Homie", "Chungus", "Lad", "Lass", "Homeboy", "Kid", "Dude", "Sad", "Happy"]],
    ["Only",["cum", "jizz", "spunk","jerk"],["inside", "to", "onto"], ["anime girls", "anime boys", "myself"]],
    ["double jointed", ["", "pussy", "leg", "arm", "head", "penis"]],
    [["fresh", "dirty", "clean"], ["balls", "head", "brain", "mind"]],
    ["I", ["regularly", "once", "sometimes", "have", "kinda", ""], ["fucked", "shagged", "slapped", "fed", "beat"], "a", ["horse", "duck", "man", "woman", "stranger"], ["", "to death"]],
    ["First the", ["kiss", "cum"], "then the", ["kiss", "cum"]],
    [["My Dick is", "My Mind is", "I am"], ["in love with", "experiencing"], ["pain", "pleasure"]],
    ["There's a", ["snake", "horse", "foot", "stash", "cock"], "in my", ["ass", "stomach", "boot", "hat", "basement"]],
    ["oh", ["no", "yes", "yeah"]],
    ["lvl", ["100", "0", "50", "69", "420"], "mafia boss"],
    [["spermicidal", "suicidal"], "maniac"],
    [["Cum", "Piss"], ["Guzzling", "Drinking", "Hoarding"], ["Gutter", "Sewer", ""], ["Slut", "Goblin", "Whore"]],
    [["Booty", "Ass"], ["Kisser", "Licker", "Eater"]],
    [["Penis", "Hymen", "Cervix", "Womb", "Pee-pee"], ["Tickler", "Toucher", "Destroyer", "Lover"]],
    [["kick", "ban", "mute"], "me"],
    ["double jointed", ["dick", "pussy"]],
    [["","comic"], "sans", ["from undertale", ""]],
    [["cum", "cumless", "booty"], "crusader"]
]



module.exports = {
    name: "New Nickname Generator",
    usage: "newnick",
    categories: ["tools", "fun"],
    rateLimit: 10,
    commands: ["newnick", "newnickname"],
    requiredPermissions: ["MANAGE_NICKNAMES"],
    unwholesome: true,
    guildOnly: true,
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

let hadNicknames = {};

function generateNickname(bot, context, tries = 0){
    let root = bot.util.arrayRand(nicknames);
    let nickname;
    if(typeof root === "string"){
        nickname = root;
    }else {
        let output = "";
        for (let i = 0; i < root.length; i++) {
            const piece = root[i];
            if (i > 0)
                output += " ";
            if (typeof piece == "string") {
                output += piece;
            } else {
                output += bot.util.arrayRand(piece)
            }
        }
        output = output.replace(/username/g, context.user.username);
        output = output.replace(/randUsername/g, (context.channel.guildMembers || context.channel.members).random().username);
        nickname = output.substring(0, 32);
    }
    if(hadNicknames[context.guild.id]?.includes(nickname) && tries < 5)
        return generateNickname(bot, context, tries+1);
    if(!hadNicknames[context.guild.id])
        hadNicknames[context.guild.id] = [];
    hadNicknames[context.guild.id].push(nickname);
    return nickname;
}