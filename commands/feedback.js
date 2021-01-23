const Discord = require('discord.js');
module.exports = {
    name: "Leave Feedback",
    usage: "feedback [message]",
    accessLevel: 0,
    rateLimit: 30,
    detailedHelp: "Complain/compliment/flirt with the developers",
    categories: ["meta"],
    commands: ["feedback", "complain", "report", "support", "broken", "broke"],
    init: function init(bot){
        if(bot.client.shard){
            bot.logger.log("Starting shard reciever for !feedback");
            process.on("message", function(msg){
               if(msg.type === "feedback") {
                   bot.lastFeedbackChannel = msg.message.channelID;
                   if(bot.client.channels.cache.has("344931831151329302"))
                       bot.client.channels.cache.get("344931831151329302").send(`Feedback from ${msg.message.userID} (${msg.message.username}) in ${msg.message.guildID} (${msg.message.guild}):\n\`\`\`\n${msg.message.message.replace(/discord\.gg/gi, "discordxgg")}\n\`\`\``);
               }else if(msg.type === "feedbackResponse"){
                    if(bot.client.channels.cache.has(msg.message.channel)){
                        bot.client.channels.cache.get(bot.lastFeedbackChannel).sendLang("FEEDBACK_RESPONSE", {
                            response: msg.message.response,
                            admin: msg.message.admin
                        });
                    }
               }
            });
        }

    },
    run: function run(message, args, bot) {
        if(message.getSetting("prefix") === "!" && args[0].indexOf("feedback") > -1 && message.channel.members && message.channel.members.has("507970352501227523"))  //Fast Food Bot
            return message.replyLang("FEEDBACK_FASTFOOD_BOT");

        if(args[0].indexOf("report") > -1 && message.mentions.users.size > 0) {
            message.replyLang("FEEDBACK_REPORT_USER");
            if(args.length <= 2)return;
        }
        if(args.length > 1){
            if(args[1].toLowerCase() === "respond" && (message.getBool("admin") || message.getBool("feedback.responder"))){
                if(bot.lastFeedbackChannel){
                    const response = message.content.substring(message.content.indexOf(args[2]));
                    if(bot.client.channels.cache.has(bot.lastFeedbackChannel)){
                        bot.client.channels.cache.get(bot.lastFeedbackChannel).sendLang("FEEDBACK_RESPONSE", {response, admin: message.author.tag});
                        message.channel.send("Responded.");
                    }else{
                        bot.client.shard.send({type: "feedbackResponse", message: {
                                channel: bot.lastFeedbackChannel,
                                response: response,
                                admin: message.author.tag
                        }});
                        message.channel.send("Responded. (On different shard)");
                    }
                }else{
                    message.channel.send("The last feedback was sent before this shard last restarted.");
                }
                return;
            }
            if(message.getBool("feedback.banned"))
                return message.channel.send("You are unable to send feedback messages.");
            bot.lastFeedbackChannel = message.channel.id;
            message.replyLang("FEEDBACK_SUCCESS");
            if(!message.getBool("feedback.shadowbanned")) {
                bot.client.shard.send({
                    type: "feedback", message: {
                        userID: message.author.id,
                        message: Discord.escapeMarkdown(message.content),
                        username: `${message.author.username}#${message.author.discriminator}`,
                        guildID: message.guild ? message.guild.id : "DM Channel",
                        guild: message.guild ? message.guild.name : "DM Channel",
                        channelID: message.channel.id
                    }
                });
            }
        }else{
            message.replyLang("FEEDBACK_ERROR");
        }
    }
};