const request = require('request');
const Sentry  = require('@sentry/node');
let commentIndex = 0;
let comments = {};
let failureTimes = 1;
module.exports = {
    name: "Opinion on",
    usage: "opinion <person>",
    categories: ["fun", "nsfw"],
    rateLimit: 2,
    commands: ["opinion"],
    nsfw: true,
    downloadComments: function downloadComments(bot){
        bot.logger.log("Downloading AI Comments...");
        request({
            url: 'https://www.reddit.com/r/gonewild/comments.json',
            headers: {
                'User-Agent': 'OcelotBOT link parser by /u/UnacceptableUse'
            }
        }, function processCommentResponse(err, resp, body) {
            if(err) {
                bot.logger.log(err);
                const timeout = 1000*(failureTimes++);
                bot.logger.log(`Trying again in ${timeout}ms`);
                setTimeout(module.exports.downloadComments, timeout, bot);
            } else {
                try {
                    const data = JSON.parse(body);
                    comments = data.data.children.filter((comment)=>comment.data.body.indexOf("http") == -1 && comment.data.body.indexOf("verif") == -1);
                    commentIndex = 0;
                    bot.logger.log("Downloaded "+comments.length+" comments");
                } catch(e) {
                    bot.raven.captureException(e);
                    bot.logger.log(e);
                    const timeout = 1000*(failureTimes++);
                    bot.logger.log(`Trying again in ${timeout}ms`);
                    setTimeout(module.exports.downloadComments, timeout, bot);
                }
            }
        });

    },
    init: function (bot){
        module.exports.downloadComments(bot);
    },
    run: function run(message, args, bot) {
        if(args.length < 2){
            message.replyLang("8BALL_NO_QUESTION");
            return;
        }
        try {
            if(message.mentions && message.mentions.members && message.mentions.members.has(bot.client.user.id)){
                 message.channel.send(`Holy fucking shit. I want to bang OcelotBOT so goddamn bad. I can't stand it anymore. Every time I go on Discord I get a massive erection. I've seen literally every rule 34 post there is of him online. My dreams are nothing but constant fucking sex with OcelotBOT. I'm sick of waking up every morning with six nuts in my boxers and knowing that those are nuts that should've been busted inside of OcelotBOTs's tight cat bussy. I want him to have my mutant human/bot babies.
Fuck, my fucking mum caught me with the neighbors cat. I'd painted her eyes green and went to fucking town. She hasn't said a word to me in 10 hours and I'm worried she's gonna take away my computer. I might not ever get to see OcelotBOT again.`)
            }else {
                message.channel.startTyping();
                if (comments.length > 0) {
                    message.channel.send(comments[commentIndex++].data.body);

                    if (commentIndex >= comments.length - 3)
                        module.exports.downloadComments(bot);
                } else {
                    message.replyLang("GENERIC_ERROR");
                }
            }
        }catch(e){
            commentIndex = 0;
            bot.logger.log("Failed - "+e);
            module.exports.downloadComments(bot);
            Sentry.captureException(e)
        }finally{
            message.channel.stopTyping();
        }
    },
    test: function(test){
        test('ai no args', function(t){
            const message = {
                replyLang: function(message){
                    t.is(message, "8BALL_NO_QUESTION");
                }
            };
            module.exports.run(message, []);
        });
        test('ai no comments', function(t){
            const message = {
                replyLang: function(message){
                    t.is(message, "GENERIC_ERROR");
                },
                channel: {
                    startTyping: function(){},
                    stopTyping: function(){}
                }
            };
            module.exports.run(message, ["ai", "test"]);
        });
        test('ai comment download', function(t){
            const bot = {
                logger: {
                    log: function(msg){
                        console.log(msg);
                    }
                },
                raven: {
                    captureException: function(){
                        t.fail();
                    }
                }
            };
            module.exports.downloadComments(bot);
            t.pass();
        });
    }
};