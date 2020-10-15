module.exports = {
    name: "Emoji Search",
    usage: "emoji <term>",
    categories: ["fun","tools"],
    requiredPermissions: [],
    commands: ["emoji", "emojisearch", "emojis", "emote"],
    run: async function(message, args, bot){
        if(!args[1]){
            message.channel.send(`Usage: ${args[0]} <term> e.g ${args[0]} thonk`);
        }else{
            let output = "";
            let emojiCount = 0;
            bot.client.emojis.cache.forEach(function(emoji){
                if(emoji.name.toLowerCase().indexOf(args[1].toLowerCase()) > -1 && output.length <= 1900 && emojiCount < message.getSetting("emoji.count")){
                    emojiCount++;
                    output +=  emoji.toString();
                }
            });
            if(output)
                message.channel.send(output);
            else
                message.replyLang("EMOJI_NOT_FOUND");
        }
    }
};