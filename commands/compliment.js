module.exports = {
    name: "Compliment",
    usage: "compliment <person>",
    categories: ["nsfw", "fun"],
    rateLimit: 10,
    detailedHelp: "Give someone a nice, if not occasionally creepy compliment.",
    usageExample: "compliment @Big P",
    responseExample: "@Big P, you could have a career as a phone sex line operator",
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
    },
    test: function(test){
        test('compliment no args', function(t){
            const message = {
                replyLang: function(message){
                    t.is(message, "COMPLIMENT_NO_PERSON")
                }
            };

            module.exports.run(message, []);
        });
        test('compliment with args', function(t){
            const message = {
                replyLang: function(message, data){
                    t.is(message, "COMPLIMENT_0");
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
        test('compliment self', function(t){
            const message = {
                replyLang: function(message, data){
                    t.is(message, "COMPLIMENT_SELF_COMPLIMENT");
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

