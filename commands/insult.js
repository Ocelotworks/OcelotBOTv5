module.exports = {
    name: "Insult Generator",
    usage: "insult <person>",
    commands: ["insult"],
    init: function(bot){
        bot.usedTopicalInsults = [];
    },
    run: function run(message, args, bot) {
        if(!args[1]){
            message.replyLang("INSULT_NO_PERSON");
            return;
        }

        if(args[1].toLowerCase() === bot.client.user.username.toLowerCase() ||
            args[1].indexOf(bot.client.user.id) > -1 ||
            (message.guild && message.guild.me.nickname && args[1].toLowerCase() === message.guild.me.nickname.toLowerCase())){
            message.replyLang("INSULT_SELF_INSULT");
        }else{
            if(bot.topicalInsult && bot.usedTopicalInsults.indexOf(message.channel.id) === -1){
                message.channel.send(bot.topicalInsult.formatUnicorn(args[1]));
            }
            message.replyLang(`INSULT_${bot.util.intBetween(1,114)}`, args[1]);
        }

    }
};