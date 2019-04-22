const request = require('request');
module.exports = {
    name: "Morse Code Generator",
    usage: "morse <text>",
    categories: ["text"],
    rateLimit: 2,
    commands: ["morse", "morsecode"],
    run: function run(message, args, bot) {
        if(args.length < 2){
            message.channel.send(`Invalid usage. ${args[0]} text`)
        }else{
            const input = encodeURIComponent(message.cleanContent.substring(args[0].length + 1));
            request(`https://api.funtranslations.com/translate/morse.json?text=${input}`, function(err, resp, body){
                if(err){
                    bot.raven.captureException(err);
                    message.replyLang("GENERIC_ERROR");
                } else {
                   try{
                       const data = JSON.parse(body);
                       console.log(data);
                       if(data.contents && data.contents.translated){
                           message.channel.send("`"+data.contents.translated+"`");
                       }else if(data.error) {
                           message.channel.send(data.error.message);
                       }else{
                           bot.logger.warn("Weird content "+body);
                           message.replyLang("GENERIC_ERROR");
                       }
                   }catch(e){
                       bot.logger.warn("parse error "+body);
                       console.log(e);
                       message.replyLang("GENERIC_ERROR");
                       bot.raven.captureException(e);
                   }
                }
            });
        }
    }
};