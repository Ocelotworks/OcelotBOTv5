const request = require('request');
module.exports = {
    name: "Wikipedia Search",
    usage: "wiki <term>",
    commands: ["wiki", "wikipedia", "wp"],
    rateLimit: 30,
    categories: ["tools"],
    run: async function run(message, args, bot){
        if(!args[1]){
            message.channel.send("Usage: !wiki <term>");
            return;
        }
        const term = encodeURIComponent(args.slice(1).join(" "));
        request("https://en.wikipedia.org/w/api.php?action=opensearch&search="+term, function(err, resp, body){
            if(err){
                message.channel.send("Error: "+err);
                bot.raven.captureException(err);
            }else{
                try{
                    const data = JSON.parse(body);
                    if(data[2].length === 0){
                        message.channel.send("No pages found.");
                    }else if(data[2][0].indexOf("refer to") > -1 || data[2][0].length <= 1){
                        message.channel.send(`**${data[1][1]}:**\n${data[2][1]}`);
                    }else{
                        message.channel.send(`**${data[1][0]}:**\n${data[2][0]}`);
                    }
                }catch(e){
                    message.channel.send("Error: "+err);
                    bot.raven.captureException(e);
                }
            }
        });
    }
};