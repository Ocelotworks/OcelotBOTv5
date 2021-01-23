/**
 * Ported by Neil - 30/04/18
 */
const request = require('request');
module.exports = {
    name: "Number Fact",
    usage: "numberfact <number>",
    categories: ["search"],
    rateLimit: 2,
    commands: ["numberfact"],
    run: function run(message, args, bot) {
        if(args.length < 2){
            message.replyLang("NUMBERFACT_USAGE");
        }else{
            request(`http://numbersapi.com/${parseInt(args[1])}/`, function(err, resp, body){
                if(err){
					bot.raven.captureException(err);
					message.replyLang("GENERIC_ERROR");
				} else {
					message.channel.send(body);
				}
            });
        }
    }
};