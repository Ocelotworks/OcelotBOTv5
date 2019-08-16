
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

            if(message.mentions && message.mentions.users.has(bot.client.user.id) && !message.author.bot){
                bot.logger.warn(`Mentioned by ${message.author.username} (${message.author.id}) in ${message.guild ? message.guild.name : "DM Channel"} (${message.guild ? message.guild.id : "DM Channel"}) ${message.channel.name} (${message.channel.id}): ${message.cleanContent}`);
                if(message.content.toLowerCase().indexOf("prefix") > -1 )
                    message.channel.send(`My prefix is **${message.getSetting("prefix")}**\nTo change the prefix, do ${message.getSetting("prefix")}settings set prefix %\nWhere % is the prefix you want.`);
                else if(message.content.toLowerCase().indexOf("help") > -1)
                    message.channel.send(`You can see my commands with ${message.getSetting("prefix")}help`);

                bot.mixpanel.track("Bot mentioned", {
                    distinct_id: message.author.id,
                    channel_id: message.channel.id,
                    channel_name: message.channel.name,
                    server_id: message.guild ? message.guild.id : "0",
                    server_name: message.guild ? message.guild.name : "DM Channel",
                    message: message.cleanContent
                })
            }

            //499354390126264340>
            if(message.getSetting("yikesUser") && message.author.id === message.getSetting("yikesUser") && message.content.length > message.getSetting("yikesThreshold")){
                message.react(message.getSetting("yikesEmoji"));
            }
        }));


        bot.client.on("voiceStateUpdate", function voiceStateUpdate(oldMember, newMember){
            if(!newMember.voiceChannelID)return;
            if(oldMember.voiceChannelID === newMember.voiceChannelID)return;
            if(!newMember.guild.me.voiceChannelID)return;
            if(newMember.guild.me.voiceChannelID !== newMember.voiceChannelID)return;
            if(!bot.util.bots.music[newMember.id])return;
            if(!bot.config.getBool(newMember.guild.id, "autorespond.musicbot"))return;
            newMember.guild.me.lastMessage.channel.send(`**Oh god, ${bot.util.bots.music[newMember.id]} too?**`);
        });

        bot.client.on("channelCreate", function channelCreate(channel){
            if(channel.deleted)return;
            if(channel.type !== "text")return;
            if(channel.name.toLowerCase().indexOf("ocelot") < 0)return;
            if(!channel.guild.getBool("autorespond.channel"))return;
            bot.logger.log(`Autoresponding to channel name ${channel.name}`);
            channel.send("Aww, a channel just for me? <3");

        });
    }
};