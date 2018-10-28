
module.exports = {
    name: "Automatic Responses",
    init: function(bot){

        bot.lastMessages = {};
        bot.lastMessageCounts = {};

        bot.client.on("message", bot.raven.wrap(async function onMessage(message) {
            if(message.channel.id === "463607437618970626")return; //What the fuck?
            if(bot.checkBan(message))return;
            if(bot.lastMessages[message.channel.id]){
                if(bot.lastMessages[message.channel.id] === message.content.toLowerCase()){
                    if(bot.lastMessageCounts[message.channel.id])
                        bot.lastMessageCounts[message.channel.id]++;
                    else
                        bot.lastMessageCounts[message.channel.id] = 1;
                    if(bot.lastMessageCounts[message.channel.id] >= 3){
                        if(!message.author.bot && message.content.length < 100 && !message.content.match(/@everyone|<@.*>|[~\-!.\[\]=/\\>+].*|http.*/gi)) {
                            bot.logger.log(`Triggered repeat autorespond at channel ${message.channel.id} from ${message.content} = ${bot.lastMessages[message.channel.id]} ${bot.lastMessageCounts[message.channel.id]} times`)
                            message.channel.send(message.content);
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
        }));
    }
};