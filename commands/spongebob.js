/**
 * Created by Peter on 02/07/2017.
 */
module.exports = {
    name: "Spongebob",
    usage: "spongebob [text]",
    requiredPermissions: ["EMBED_LINKS"],
    commands: ["spongebob"],
    categories: ["text", "memes"],
    run: async function run(message, args, bot) {
        let doSponge = function doSponge(input){
            let output = "";
            for(let i in input){
                if(input.hasOwnProperty(i))
                    if(Math.random() > 0.5)output+= input[i].toLowerCase();
                    else output+= input[i].toUpperCase();
            }
            message.channel.send(output, {
                embed: {
                    image: {
                        url: message.getSetting("spongebob.url")
                    }
                }
            });
        };

        if(!args[1]){
            const messages = await message.channel.messages.fetch({limit: 2});
            if(messages.size > 1){
                const message = messages.last();
                doSponge(message.content);
            }else{
                message.replyLang("SPONGEBOB_NO_TEXT")
            }
        }else{
            doSponge(message.content.substring(args[0].length));
        }

    }
};