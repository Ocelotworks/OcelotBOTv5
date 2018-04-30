module.exports = {
    name: "Leave Feedback",
    usage: "feedback [message]",
    accessLevel: 0,
    commands: ["feedback", "complain", "report", "support", "error", "broken", "broke"],
    init: function init(bot){
        if(bot.client.shard){
            bot.logger.log("Starting shard reciever for !feedback");
            process.on("message", function(msg){
               if(msg.type === "feedback")
                   bot.client.channels.get("344931831151329302").send(`Feedback from ${msg.message.userID} (${msg.message.username}) in ${msg.message.guildID} (${msg.message.guild}):\n\`\`\`\n${msg.message.message}\n\`\`\``);
            });
        }
    },
    run: function run(message, args, bot) {
        if(args.length > 1){
           message.replyLang("FEEDBACK_SUCCESS");
            if(!bot.client.shard || bot.client.channels.has("344931831151329302")){
                bot.client.channels.get("344931831151329302").send(`Feedback from ${message.author.id} (${message.author.username}#${message.author.discriminator}) in ${message.guild.id} (${message.guild.name}):\n\`\`\`\n${message.content}\n\`\`\``);
             }else{
                bot.client.shard.send({type: "feedback", message: {
                        userID: message.member.id,
                        message: message.content,
                        username: `${message.author.username}#${message.author.discriminator}`,
                        guildID: message.guild.id,
                        guild: message.guild.name
                }});
            }
        }else{
            message.replyLang("FEEDBACK_ERROR");
        }
    }
};