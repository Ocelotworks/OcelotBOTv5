
module.exports = {
    name: "Automatic Responses",
    init: function(bot){

        bot.lastMessages = {};
        bot.lastMessageCounts = {};

        bot.client.on("message", bot.raven.wrap(async function onMessage(message) {
            if(message.channel.id === "463607437618970626")return; //What the fuck?
            if(bot.lastMessages[message.channel.id]){
                if(bot.lastMessages[message.channel.id] === message.content.toLowerCase()){
                    if(bot.lastMessageCounts[message.channel.id])
                        bot.lastMessageCounts[message.channel.id]++;
                    else
                        bot.lastMessageCounts[message.channel.id] = 1;
                    if(message.getSetting("autorespond.threshold") <= 1)return;
                    if(bot.lastMessageCounts[message.channel.id] >= message.getSetting("autorespond.threshold")){
                        if(!message.author.bot && !message.content.match(/@everyone|pls|spam|@here|raid|<@.*>|[-!.\]=/\\>+].*|http.*/gi)) {
                            bot.logger.log(`Triggered repeat autorespond at channel ${message.channel.id} from ${message.content} = ${bot.lastMessages[message.channel.id]} ${bot.lastMessageCounts[message.channel.id]} times`)
                            let matchableContent = message.content.toLowerCase();
                            if(matchableContent.indexOf("ocelotbot") > -1){
                                matchableContent = matchableContent.replace("ocelotbot", `<@${message.author.id}>`);
                                message.channel.send(matchableContent);
                            }else{
                                message.channel.send(message.content);
                            }


                        }
                        bot.lastMessageCounts[message.channel.id] = -1000;
                    }
                }else{
                    bot.lastMessageCounts[message.channel.id] = 0;
                    bot.lastMessages[message.channel.id] = message.content.toLowerCase();
                }
            }else{
                bot.lastMessages[message.channel.id] = message.content.toLowerCase();
            }

            //499354390126264340>
            if(message.getSetting("yikesUser") && message.author.id === message.getSetting("yikesUser") && message.content.length > message.getSetting("yikesThreshold")){
                message.react(message.getSetting("yikesEmoji"));
            }
        }));
    }
};