const request = require('request');
module.exports = {
    name:  "Dictionary Lookup",
    usage: "define <word>",
    categories: ["tools", "fun"],
    commands: ["define", "def", "dictionary", "dict"],
    run: function run(message, args, bot) {
        if(!args[1]){
            message.channel.send(`Usage: ${args[0]} <term>`);
            return;
        }
        const term = encodeURIComponent(args.slice(1).join(" "));
        request("http://api.pearson.com/v2/dictionaries/ldoce5/entries?headword="+term, function(err, resp, body){
            if(err){
                message.channel.send("Error: "+err);
                bot.raven.captureException(err);
            }else{
                try{
                    const data = JSON.parse(body);
                    if (data.status !== 200) {
                        message.replyLang("DEFINE_ERRORNUM", {num: data.status});
                    } else if (data.count === 0) {
                        message.replyLang("DEFINE_NOT_FOUND");
                    }else if(!data.results[0].senses){
                        message.replyLang("DEFINE_NO_SENSES");
                        message.channel.send(":thinking: Word exists but has no definition.")
                    }else if(!data.results[0].senses[0].definition){
                        message.replyLang("DEFINE_NO_DEFINITION");
                    }else{
                        bot.util.standardPagination(message.channel, data.results, async function(page){
                            return `*${page.headword}* _${page.part_of_speech ? page.part_of_speech : "Thing"}_:\n\`\`\`\n${page.senses[0] ? page.senses[0].definition : ":thinking: Word exists but has no definition."}\n\`\`\``
                        }, true);
                    }
                }catch(e){
                    message.channel.send("Error: "+err);
                    bot.raven.captureException(e);
                }
            }
        });

    }
};