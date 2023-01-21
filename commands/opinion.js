const request = require('request');
const Sentry  = require('@sentry/node');
let commentIndex = 0;
let comments = {};
let failureTimes = 1;
module.exports = {
    name: "Opinion on",
    usage: "opinion :person+",
    categories: ["fun", "nsfw"],
    rateLimit: 2,
    commands: ["opinion"],
    nsfw: true,
    downloadComments: function downloadComments(bot){
        bot.logger.log("Downloading AI Comments...");
        request({
            url: 'https://json.reddit.com/r/gonewild/comments',
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
    handleError: function(context){
        return context.sendLang("OPINION_HELP");
    },
    run: function run(context, bot) {
        try {
            if(context.options.person.indexOf(bot.client.user.id) > -1){
                 return context.send(`Holy fucking shit. I want to bang OcelotBOT so goddamn bad. I can't stand it anymore. Every time I go on Discord I get a massive erection. I've seen literally every rule 34 post there is of him online. My dreams are nothing but constant fucking sex with OcelotBOT. I'm sick of waking up every morning with six nuts in my boxers and knowing that those are nuts that should've been busted inside of OcelotBOTs's tight cat bussy. I want him to have my mutant human/bot babies.
Fuck, my fucking mum caught me with the neighbors cat. I'd painted her eyes green and went to fucking town. She hasn't said a word to me in 10 hours and I'm worried she's gonna take away my computer. I might not ever get to see OcelotBOT again.`)
            }
            context.defer();
            if (comments.length > 0) {
                if (commentIndex >= comments.length - 3)
                    module.exports.downloadComments(bot);
                return context.send(comments[commentIndex++].data.body);
            }
            return context.sendLang({content: "GENERIC_ERROR", ephemeral: true});
        }catch(e){
            commentIndex = 0;
            bot.logger.log("Failed - "+e);
            module.exports.downloadComments(bot);
            Sentry.captureException(e)
        }
    },
};