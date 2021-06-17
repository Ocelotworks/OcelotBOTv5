const customInsults = {
    "235088799074484224": ["you can't even play songs well!", "Groovy is a better music bot than you!", "you're laggy as fuck.", "you're the shittest bot"], //Rhythm
    "239631525350604801": ["you can't even play songs well!", "Groovy is a better music bot than you!", "you're laggy as fuck.", "you're the shittest bot", "more like shit-cake"], //Pancake
    "234395307759108106": ["you can't even play songs well!", "Rhythm is a better music bot than you!", "you're laggy as fuck.", "you're the shittest bot"], //Groovy
    "461521980492087297": ["the dog in your avatar is dumb as fuck", "fuck you dog ass little cunt bot"], //Shiro
    "159985870458322944": ["fuck your blue little face", "the mee6 premium package is worthless", "your moderation commands are shit"], //Mee6
    "185476724627210241": ["music isn't the only thing that is disabled.", "weeb bots suck!"], //Ayana
    "242730576195354624": ["you're the worst moderation bot ever made", "more like nazi bot", "more like a-shit-ja"], //Autaja
    "418842777720193037": ["I'd like to apply to kick your ass, dumb bot", "pointless bot", "your commands suck"], //Application Bot
    "422087909634736160": ["you're the worst server list!","what's even the point of this bot"], //Discord Server List
    "439205512425504771": ["my commands are better than yours!","you're always down!", "more like notsogood!"], //NotSoBot
    "172002275412279296": ["my commands are better than yours!","more like shitsumaki"], //Tatsumaki
    "270904126974590976": ["I am a better meme bot than you!", "dumb stupid green frog", "the whole 'pls' command thing is dumb", "just because you're in more servers than me doesn't mean you're not shit!"], //Dank memer
    "367835200916291586": ["2012 called it wants it's stupid frog meme back", "get better commands!"]
};
module.exports = {
    name: "Insult Generator",
    usage: "insult :person+",
    commands: ["insult"],
    detailedHelp: "Insult someone/something",
    usageExample: "insult @Big P",
    responseExample: "@Big P I hope you step in a puddle... with socks on.",
    categories: ["fun"],
    unwholesome: true,
    run: function run(context, bot) {
        const term = context.options.person;
        const mention = bot.util.getUserFromMention(term);
        if(customInsults[mention?.id])return context.send(`<@${mention.id}>, ${bot.util.arrayRand(customInsults[mention.id])}`);
        if(term.toLowerCase() === "@everyone")return context.sendLang("INSULT_EVERYONE");
        if(term.toLowerCase() === bot.client.user.username.toLowerCase() || term.indexOf(bot.client.user.id) > -1 || (term.toLowerCase() === message.guild?.me?.nickname?.toLowerCase()))return context.sendLang("INSULT_SELF_INSULT");
        return context.sendLang(`INSULT_${bot.util.intBetween(1,114)}`, {term});
    },
};