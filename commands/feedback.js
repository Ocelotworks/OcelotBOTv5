const Discord = require('discord.js');
module.exports = {
    name: "Leave Feedback",
    usage: "feedback :message+",
    accessLevel: 0,
    rateLimit: 30,
    detailedHelp: "Complain/compliment/flirt with the developers",
    usageExample: "feedback this bot is amazing!",
    responseExample: "✅ Your feedback has been recorded.",
    categories: ["meta"],
    commands: ["feedback", "complain", "report", "support", "broken", "broke"],
    init: function init(bot){
        bot.logger.log("Starting shard receiver for !feedback");
        bot.bus.on("feedback", function(msg){
            bot.lastFeedbackChannel = msg.message.channelID;
            if(bot.client.channels.cache.has("344931831151329302"))
                bot.client.channels.cache.get("344931831151329302").send(`Feedback from ${msg.message.userID} (${msg.message.username}) in ${msg.message.guildID} (${msg.message.guild}):\n\`\`\`\n${msg.message.message.replace(/discord\.gg/gi, "discordxgg")}\n\`\`\``);
        });
        bot.bus.on("feedbackResponse", function(msg){
            if(bot.client.channels.cache.has(msg.message.channel)){
                bot.client.channels.cache.get(bot.lastFeedbackChannel).sendLang("FEEDBACK_RESPONSE", {
                    response: msg.message.response,
                    admin: msg.message.admin
                });
            }
        })
    },
    run: async function run(context, bot) {
        if(context.getSetting("prefix") === "!" && context.command === "feedback" && context.channel?.members?.has("507970352501227523"))  //Fast Food Bot
            return context.replyLang({content: "FEEDBACK_FASTFOOD_BOT", ephemeral: true});

        if(context.command === "report" && context.options.message.indexOf("<@") > -1)
            return context.replyLang({content: "FEEDBACK_REPORT_USER", ephemeral: true});

        if(context.options.message.toLowerCase().startsWith("respond") && (context.getBool("admin") || context.getBool("feedback.responder"))){
            if(bot.lastFeedbackChannel){
                const response = context.options.message.substring("respond ".length);
                bot.rabbit.event({type: "feedbackResponse", message: {
                        channel: bot.lastFeedbackChannel,
                        response: response,
                        admin: await bot.util.getUserTag(context.user.id)
                    }});
                return context.send("Responded. (On different shard)");
            }
            return context.send("The last feedback was sent before this shard last restarted.");
        }

        if(context.channel.id === "344931831151329302")
            return context.reply({content: "You forgot 'respond'", ephemeral: true});

        if(context.getBool("feedback.banned"))
            return context.replyLang({content: "FEEDBACK_BANNED", ephemeral: true});

        bot.lastFeedbackChannel = context.channel.id;
        context.sendLang("FEEDBACK_SUCCESS");
        if(context.getBool("feedback.shadowbanned"))return;

        bot.rabbit.event({
            type: "feedback", message: {
                userID: context.user.id,
                message: Discord.Util.escapeMarkdown(context.options.message),
                username: `${await bot.util.getUserTag(context.user.id)}`,
                guildID: context.guild?.id || context.channel.id,
                guild: context.guild?.name || "DM Channel",
                channelID: context.channel.id,
            }
        });
    }
};