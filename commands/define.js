const request = require('request');
module.exports = {
    name:  "Dictionary Lookup",
    usage: "define <word>",
    categories: ["tools", "fun"],
    commands: ["define", "def", "dictionary", "dict"],
    run: function run(message, args, bot) {
        if(!args[1]){
            message.channel.send(`Usage: ${(message.guild && bot.prefixCache[message.guild.id]) || "!"}define <term>`);
            return;
        }
        const term = encodeURIComponent(args.slice(1).join(" "));
        request("http://api.pearson.com/v2/dictionaries/ldoce5/entries?headword="+term+"&limit=1", function(err, resp, body){
            if(err){
                message.channel.send("Error: "+err);
                bot.raven.captureException(err);
            }else{
                try{
                    const data = JSON.parse(body);
                    if (data.status !== 200) {
                        message.channel.send(":bangbang: Error #" + data.status);
                    } else if (data.count === 0) {
                        message.channel.send(":warning: No definitions found.");
                    }else if(!data.results[0].senses){
                        message.channel.send(":thinking: Word exists but has no definition.")
                    }else if(!data.results[0].senses[0].definition){
                        message.channel.send(":warning: No definition for that word. Be more specific perhaps?");
                    }else{
                        const result = data.results[0];
                        message.channel.send( `*${result.headword}* _${result.part_of_speech ? result.part_of_speech : "Thing"}_:\n\`\`\`\n${result.senses[0].definition}\n\`\`\``);
                    }
                }catch(e){
                    message.channel.send("Error: "+err);
                    bot.raven.captureException(e);
                }
            }
        });

    }
};