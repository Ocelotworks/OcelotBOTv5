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
    usage: "insult <person>",
    commands: ["insult"],
    detailedHelp: "Insult someone/something",
    usageExample: "insult @Big P",
    responseExample: "@Big P I hope you step in a puddle... with socks on.",
    categories: ["fun"],
    unwholesome: true,
    slashOptions: [{type: "STRING", name: "subject", description: "The person or phrase that you want to insult", required: true}],
    run: function run(message, args, bot) {
        if(!args[1])
            return message.replyLang("INSULT_NO_PERSON");

        const term = args.slice(1).join(" ");
        const mention = bot.util.getUserFromMention(args[1]);
        if(customInsults[mention?.id])return message.channel.send(`<@${mention.id}>, ${bot.util.arrayRand(customInsults[mention.id])}`);
        if(args[1].toLowerCase() === "@everyone")return message.replyLang("INSULT_EVERYONE");
        if(args[1].toLowerCase() === bot.client.user.username.toLowerCase() || args[1].indexOf(bot.client.user.id) > -1 || (args[1].toLowerCase() === message.guild?.me?.nickname?.toLowerCase()))return message.replyLang("INSULT_SELF_INSULT");
        return message.replyLang(`INSULT_${bot.util.intBetween(1,114)}`, {term});
    },
    runSlash: function(interaction, bot){
        const input = interaction.options.get("subject").value;
        const mention = bot.util.getUserFromMention(input);
        if(customInsults[mention?.id])return interaction.reply(`<@${mention.id}>, ${bot.util.arrayRand(customInsults[mention.id])}`);
        if(input.toLowerCase() === "@everyone")return interaction.replyLang("INSULT_EVERYONE");
        if(input.toLowerCase() === bot.client.user.username.toLowerCase() || input.indexOf(bot.client.user.id) > -1 || (input.toLowerCase() === interaction.guild?.me?.nickname?.toLowerCase()))return interaction.replyLang("INSULT_SELF_INSULT");
        return interaction.replyLang(`INSULT_${bot.util.intBetween(1,114)}`, {term: input});
    }
};