/**
 * Created by Peter on 01/07/2017.
 */

const request = require('request');
module.exports = {
    name: "Urban Dictionary",
    usage: "defineud <word>",
    commands: ["defineud", "ud", "urban"],
    run: function run(message, args, bot) {
        const term = encodeURIComponent(args.slice(1).join(" "));
        request(`http://api.urbandictionary.com/v0/define?term=${term}`, async function(err, resp, body){
            if(err){
                bot.raven.captureException(err);
                bot.logger.error(err.stack);
                message.replyLang("UD_ERROR");
            }else{
                try{
                    const data = JSON.parse(body);
                    if(data && data.list.length > 0){
                        const entry = data.list[0];
                        message.replyLang("UD_DEFINITION", {word: entry.word, definition: entry.definition, example: entry.example});
                    }else{
                        message.replyLang("UD_NO_DEFINITIONS");
                    }
                }catch(e){
                    bot.raven.captureException(e);
                    bot.logger.error(e.stack);
                    message.replyLang("UD_INVALID_RESPONSE");
                }
            }
        });

    }
};