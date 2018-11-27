const request = require('request');
let commentIndex = 0;
let comments = {};
let failureTimes = 1;
module.exports = {
    name: "Artificial Intelligence",
    usage: "ai <question>",
    categories: ["fun", "nsfw"],
    rateLimit: 2,
    commands: ["ai", "askai", "siri", "alexa", "skynet"],
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
                    comments = data.data.children;
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
            message.channel.startTyping();
            if (comments.length > 0) {
                // if (comments[commentIndex++].data.body.indexOf("gonewild") > -1)
                //     commentIndex++;

                message.channel.send(comments[commentIndex++].data.body);

                if (commentIndex === comments.length)
                    module.exports.downloadComments(bot);
            } else {
                message.replyLang("GENERIC_ERROR");
            }
            message.channel.stopTyping();
        }catch(e){
            module.exports.downloadComments(bot);
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