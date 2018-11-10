
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
                    if(bot.lastMessageCounts[message.channel.id] >= 3){
                        if(!message.author.bot && !message.content.match(/@everyone|@here|raid|<@.*>|[-!.\]=/\\>+].*|http.*/gi)) {
                            bot.logger.log(`Triggered repeat autorespond at channel ${message.channel.id} from ${message.content} = ${bot.lastMessages[message.channel.id]} ${bot.lastMessageCounts[message.channel.id]} times`)
                            if(message.content === "yui spank nut" && Math.random() > 0.7) {
                                message.channel.send("Seriously you guys have been saying yui spank nut for days now what the hell I just wanna know whats going on");
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
        }));
    }
};