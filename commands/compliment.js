module.exports = {
    name: "Compliment",
    usage: "compliment <person>",
    categories: ["fun"],
    rateLimit: 10,
    commands: ["compliment", "complement", "complament"],
    init: function(bot){
      bot.usedTopicalCompliments = [];
    },
    run: function run(message, args, bot) {
        if(!args[1]){
           message.replyLang("COMPLIMENT_NO_PERSON");
           return;
        }
        const term = args.slice(1).join(" ");

        if(args[1].toLowerCase() === bot.client.user.username.toLowerCase() ||
            args[1].indexOf(bot.client.user.id) > -1 ||
            (message.guild && message.guild.me.nickname && args[1].toLowerCase() === message.guild.me.nickname.toLowerCase())){
            message.replyLang("COMPLIMENT_SELF_COMPLIMENT");
        }else{
            if(bot.topicalCompliment && bot.usedTopicalCompliments.indexOf(message.channel.id) === -1){
                message.channel.send(bot.topicalCompliment.formatUnicorn(term));
                bot.usedTopicalCompliments.push(message.channel.id);
            }else {
                message.replyLang(`COMPLIMENT_${bot.util.intBetween(1, 27)}`, {term});
            }
        }

    }
};