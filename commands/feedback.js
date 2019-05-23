const Discord = require('discord.js');
module.exports = {
    name: "Leave Feedback",
    usage: "feedback [message]",
    accessLevel: 0,
    rateLimit: 30,
    categories: ["meta"],
    commands: ["feedback", "complain", "report", "support", "broken", "broke"],
    init: function init(bot){
        if(bot.client.shard){
            bot.logger.log("Starting shard reciever for !feedback");
            process.on("message", function(msg){
               if(msg.type === "feedback") {
                   bot.lastFeedbackChannel = msg.message.channelID;
                   if(bot.client.channels.has("344931831151329302"))
                       bot.client.channels.get("344931831151329302").send(`Feedback from ${msg.message.userID} (${msg.message.username}) in ${msg.message.guildID} (${msg.message.guild}):\n\`\`\`\n${msg.message.message}\n\`\`\``);
               }else if(msg.type === "feedbackResponse"){
                    if(bot.client.channels.has(msg.message.channel)){
                        bot.client.channels.get(bot.lastFeedbackChannel).sendLang("FEEDBACK_RESPONSE", {
                           response: msg.message.response,
                        });
                       // bot.client.channels.get(bot.lastFeedbackChannel).send(`:grey_exclamation: An admin has responded to your feedback.\n\`\`\`\n${msg.message.response}\n\`\`\`\nUse **${(bot.prefixCache[msg.message.guildID]) || "!"}feedback** to reply back.`)
                    }
               }
            });
        }

    },
    run: function run(message, args, bot) {
        if(args.length > 1){
            if(args[1].toLowerCase() === "respond" && bot.admins.indexOf(message.author.id) > -1){
                if(bot.lastFeedbackChannel){
                    const response = message.content.substring(message.content.indexOf(args[2]));
                    if(bot.client.channels.has(bot.lastFeedbackChannel)){
                        bot.client.channels.get(bot.lastFeedbackChannel).sendLang("FEEDBACK_RESPONSE", {response});
                        message.channel.send("Responded.");
                    }else{
                        bot.client.shard.send({type: "feedbackResponse", message: {
                            channel: bot.lastFeedbackChannel,
                            response: response
                        }});
                        message.channel.send("Responded. (On different shard)");
                    }
                }else{
                    message.channel.send("The last feedback was sent before this shard last restarted.");
                }
                return;
            }
           bot.lastFeedbackChannel = message.channel.id;
           message.replyLang("FEEDBACK_SUCCESS");
            if(!bot.client.shard || bot.client.channels.has("344931831151329302")){
                bot.client.channels.get("344931831151329302").send(`Feedback from ${message.author.id} (${message.author.username}#${message.author.discriminator}) in ${message.guild ? message.guild.id :"DM Channel"} (${message.guild ? message.guild.name : "DM Channel"}):\n\`\`\`\n${message.content}\n\`\`\``);
             }else{
                bot.client.shard.send({type: "feedback", message: {
                        userID: message.author.id,
                        message: Discord.escapeMarkdown(message.content),
                        username: `${message.author.username}#${message.author.discriminator}`,
                        guildID: message.guild ? message.guild.id : "DM Channel",
                        guild: message.guild ? message.guild.name : "DM Channel",
                        channelID: message.channel.id
                }});
            }
        }else{
            message.replyLang("FEEDBACK_ERROR");
        }
    }
};