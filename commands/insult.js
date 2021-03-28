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
    init: function(bot){
        bot.usedTopicalInsults = [];
    },
    run: function run(message, args, bot) {
        if(!args[1]){
            message.replyLang("INSULT_NO_PERSON");
            return;
        }

        const term = args.slice(1).join(" ");

        const mention = bot.util.getUserFromMention(args[1]);
        if(mention && customInsults[mention.id]){
            message.channel.send(`<@${mention.id}>, ${bot.util.arrayRand(customInsults[mention.id])}`);
        }else if(args[1].toLowerCase() === "@everyone"){
            return message.replyLang("INSULT_EVERYONE");
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
                    },
                    getUserFromMention: ()=>undefined,
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
                        t.is(message, "You are a fucking idiot and you should never @everyone on this discord again and I'm fucking serious. I almost have a feeling you're the only guy making all these @everyone pings because you're a dumbass who likes to be annoying and @everyone for the LULZ and get a reaction out of @everyone . Fuck you, be good at something in YOUR life and then maybe try to troll these fucking idiots on discord, like I give a fuck. It's so easy to spot out your @everyone now, you're a retard. Always doing stupid shit like this. Why don't you try to be a good user? Just for once not @everyone ? For once in your fucking life try not to @everyone on this discord. That's just you, you're always right at getting it wrong. Fuck you. You are nothing.");
                    }
                }
            };
            const bot = {
                util: {
                    intBetween: function(){
                        return 0;
                    },
                    getUserFromMention: ()=>undefined,
                },
                client: {
                    user: {
                        username: "ocelotbot"
                    }
                }
            };
            const args = ["!insult", "@everyone"];
            module.exports.run(message, args, bot);
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
                    },
                    getUserFromMention: ()=>undefined,
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