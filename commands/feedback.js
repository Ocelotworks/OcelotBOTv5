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
    commands: ["feedback", "complain", "support", "broken", "broke"],
    init: function init(bot){
        bot.interactions.addHandler("F", async (interaction)=>{
            if(!(bot.config.getBool(interaction.guild_id, "admin", interaction.member.user.id)|| bot.config.getBool(interaction.guild_id, "feedback.responder", interaction.member.user.id)))
                return {type: 4, data: {flags: 64, content: "You're not allowed to use that button"}};
            const [guildId, channelId] = interaction.data.custom_id.substring(1).split("/");
            const channel = await bot.client.guilds.fetch(guildId).then((g)=>g.channels.fetch(channelId)).catch(()=>null);
            if(!channel)return {type: 4, data: {flags: 64, content: "Channel has been deleted or server was left."}};
            const feedbackChannel = await bot.client.channels.fetch(interaction.channel_id);
            let thread = await feedbackChannel.threads.create({
                startMessage: interaction.message.id,
                name: `${channel.guild.name} - ${channel.id}`,
                autoArchiveDuration: 1440,
                reason: "Feedback thread requested",
            });
            thread.send({content: `<@${interaction.member.user.id}>`});
            let message = await feedbackChannel.messages.fetch(interaction.message.id);
            message.edit({components: []});
            return {type: 6};
        })

        bot.client.on("messageCreate", async (message)=>{
            if(bot.drain)return;
            if(!message.channel.isThread() || bot.config.get(message.guild.id, "feedback.channel") !== message.channel.parent.id || message.author.bot)return;
            if(message.channel.ownerId !== bot.client.user.id)return;
            if(message.content.startsWith(bot.config.get(message.guild.id, "prefix")))return;
            let channelID = message.channel.name.split("-")[1];
            if(!channelID)return;
            let responseChannel = await bot.client.channels.fetch(channelID.trim());
            responseChannel.sendLang("FEEDBACK_RESPONSE", {
                response: message.content,
                admin: message.author.tag,
            });
        })

       // bot.client.on("messageEdited", (oldMessage, newMessage)=>{})
    },
    run: async function run(context, bot) {
        if(context.getSetting("prefix") === "!" && context.command === "feedback" && context.channel?.members?.has("507970352501227523"))  //Fast Food Bot
            return context.replyLang({content: "FEEDBACK_FASTFOOD_BOT", ephemeral: true});

        if(context.command === "report" && context.options.message.indexOf("<@") > -1)
            return context.replyLang({content: "FEEDBACK_REPORT_USER", ephemeral: true});

        if(context.getBool("admin") || context.getBool("feedback.responder")){
            let subCommand = context.options.message.toLowerCase();
            if(subCommand.startsWith("respond")){
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

            if(subCommand.startsWith("thread")){
                let channelId = subCommand.substring(7);
                const channel = await bot.client.channels.fetch(channelId).catch(()=>null);
                if(!channel)return context.send({content: "Channel has been deleted or server was left.", ephemeral: true});
                return channel.threads.create({
                    startMessage: context.message.id,
                    name: `${channel.guild.name} - ${channel.id}`,
                    autoArchiveDuration: 1440,
                    reason: "Feedback thread requested",
                }).then((t)=>t.send({content: `<@${context.user.id}>`}));
            }
        }

       // if(context.channel.id === context.getSetting("feedback.channel"))
        //    return context.reply({content: "You forgot 'respond'", ephemeral: true});

        if(context.getBool("feedback.banned"))
            return context.replyLang({content: "FEEDBACK_BANNED", ephemeral: true});

        bot.lastFeedbackChannel = context.channel.id;
        context.sendLang("FEEDBACK_SUCCESS");
        if(context.getBool("feedback.shadowbanned"))return;


        // Discord.js can't fetch a channel for a guild that hasn't been fetched, so need a quick hack here
        const feedbackChannel = await bot.client.guilds.fetch("322032568558026753").then((g)=>g.channels.fetch(context.getSetting("feedback.channel")));
        if(!feedbackChannel)return bot.logger.warn(`Could not fetch feedback channel! ${context.getSetting("feedback.channel")}`);
        let feedbackMessage = Discord.Util.escapeMarkdown(context.options.message).replace(/discord\.gg/gi, "discordxgg");
        let thread = await feedbackChannel.threads.fetch({active: true}).then((result)=>result.threads.find((t)=>t.name.endsWith(context.channel.id))).catch(console.error);
        if(!thread)
            return feedbackChannel.send({
                components: [bot.util.actionRow({type: 2, custom_id: `F${context.guild?.id}/${context.channel.id}`, label: "Thread...", style: 2})],
                content: `Feedback from ${context.user.id} (${await bot.util.getUserTag(context.user.id)}) in ${context.guild?.id} (${context.guild?.name}):\n\`\`\`\n${feedbackMessage}\n\`\`\``
            });

        let webhook = await feedbackChannel.fetchWebhooks().then((w)=>w.first());

        return webhook.send({
            username: `${await bot.util.getUserTag(context.user.id)} (${context.user.id})`,
            avatarURL: context.user.avatarURL(),
            threadId: thread.id,
            content: feedbackMessage,
        })
    }
};