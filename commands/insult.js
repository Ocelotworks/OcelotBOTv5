module.exports = {
    name: "Insult Generator",
    usage: "insult <person>",
    commands: ["insult"],
    categories: ["fun"],
    init: function(bot){
        bot.usedTopicalInsults = [];
    },
    run: function run(message, args, bot) {
        if(!args[1]){
            message.replyLang("INSULT_NO_PERSON");
            return;
        }

        const term = args.slice(1).join(" ");

        if(args[1].toLowerCase() === "@everyone"){
            message.channel.send("You are a fucking idiot and you should never @everyone on this discord again and I'm fucking serious. I almost have a feeling you're the only guy making all these @everyone pings because you're a faggot who likes to be annoying and @everyone for the LULZ and get a reaction out of @everyone . Fuck you, be good at something in YOUR life and then maybe try to troll these fucking idiots on discord, like I give a fuck. It's so easy to spot out your @everyone now, you're a retard. Always doing stupid shit like this. Why don't you try to be a good user? Just for once not @everyone ? For once in your fucking life try not to @everyone on this discord. That's just you, you're always right at getting it wrong. Fuck you. You are nothing.");
        }else if(args[1].toLowerCase() === bot.client.user.username.toLowerCase() ||
            args[1].indexOf(bot.client.user.id) > -1 ||
            (message.guild && message.guild.me.nickname && args[1].toLowerCase() === message.guild.me.nickname.toLowerCase())){
            message.replyLang("INSULT_SELF_INSULT");
        }else{
            if(bot.topicalInsult && bot.usedTopicalInsults.indexOf(message.channel.id) === -1){
                message.channel.send(bot.topicalInsult.formatUnicorn(term));
                bot.usedTopicalInsults.push(message.channel.id);
            }else{
                message.replyLang(`INSULT_${bot.util.intBetween(1,114)}`, {term});
            }
        }
    },
    test: function(test){
        test('insult no args', function(t){
            const message = {
                replyLang: function(message){
                    t.is(message, "INSULT_NO_PERSON");
                }
            };
            const args = [];
            module.exports.run(message, args);
        });
        test('insult with args', function(t){
            const message = {
                replyLang: function(message, data){
                    t.is(message, "INSULT_0");
                    t.deepEqual(data, {
                        term: "of args"
                    });
                },
                guild: {
                    me: {
                        nickname: "ocelotbot"
                    }
                }
            };
            const bot = {
                util: {
                    intBetween: function(){
                        return 0;
                    }
                },
                client: {
                    user: {
                        username: "ocelotbot"
                    }
                }
            };
            const args = ["loads", "of", "args"];
            module.exports.run(message, args, bot);
        });
        test('insult @everyone', function(t){
            const message = {
                channel: {
                    send: function(message){
                        t.is(message, "You are a fucking idiot and you should never @everyone on this discord again and I'm fucking serious. I almost have a feeling you're the only guy making all these @everyone pings because you're a faggot who likes to be annoying and @everyone for the LULZ and get a reaction out of @everyone . Fuck you, be good at something in YOUR life and then maybe try to troll these fucking idiots on discord, like I give a fuck. It's so easy to spot out your @everyone now, you're a retard. Always doing stupid shit like this. Why don't you try to be a good user? Just for once not @everyone ? For once in your fucking life try not to @everyone on this discord. That's just you, you're always right at getting it wrong. Fuck you. You are nothing.");
                    }
                }
            };
            const args = ["!insult", "@everyone"];
            module.exports.run(message, args);
        });
        test('insult self', function(t){
            const message = {
                replyLang: function(message, data){
                    t.is(message, "INSULT_SELF_INSULT");
                },
                guild: {
                    me: {
                        nickname: "ocelotbot"
                    }
                }
            };
            const bot = {
                util: {
                    intBetween: function(){
                        return 0;
                    }
                },
                client: {
                    user: {
                        username: "ocelotbot"
                    }
                }
            };
            const args = ["insult", "ocelotbot"];
            module.exports.run(message, args, bot);
        });
    }
};