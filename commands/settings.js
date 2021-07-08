module.exports = {
    name: "Bot Settings",
    usage: "settings",
    categories: ["meta"],
    commands: ["settings", "config", "setting"],
    nestedDir: "settings",
    guildOnly: true,
    settingsOnly: true,
    requiredPermissions: ["EMBED_LINKS"],
    init: function(bot){
        // Disable if allowNSFW is turned on
        bot.addCommandMiddleware(async (context)=>{
            if (context.getBool("allowNSFW") && context.commandData.categories.indexOf("nsfw") > -1) {
                if(context.interaction){
                    context.replyLang({ephemeral: true, content: "GENERIC_CHANNEL_DISABLED"}, {command: context.command});
                    return false;
                }
                const dm = await context.author.createDM();
                dm.send(`NSFW commands are disabled in this server.`);
                this.bot.logger.log(`NSFW commands are disabled in this server (${context.guild.id}): ${context}`);
                return false;
            }
            return true;
        });

        // Disable commands that are disabled
        bot.addCommandMiddleware((context)=>{
            console.log(`${context.command}.disable`, context.getBool(`${context.command}.disable`));
            if (context.getBool(`${context.command}.disable`)) {
                bot.logger.log(`${context.command} is disabled in this server`);
                return false;
            }
            if(context.commandData.subCommands && context.options.command && context.getBool(`${context.command}.${context.options.command}.disable`)) {
                bot.logger.log(`${context.command} ${context.options.command} is disabled in this server`);
                return false;
            }
            return true;
        });

        // Wholesome mode
        bot.addCommandMiddleware((context)=>{
            if (!context.getBool("wholesome"))return true;
            if (context.commandData.categories.indexOf("nsfw") > -1 || context.commandData.unwholesome) {
                context.replyLang({content: "GENERIC_WHOLESOME", ephemeral: true});
                return false;
            }
            let content = context.message ? context.message.content : context.interaction.options.map((o)=>o.value).join(" ");
            if (bot.util.swearRegex.exec(content)) {
                context.reply({content: "No swearing!", ephemeral: true});
                return false;
            }
            return true;
        });

        // Disable/restriction channels
        bot.addCommandMiddleware(async (context)=>{
            const channelDisable = context.getSetting(`${context.command}.channelDisable`);
            const channelRestriction = context.getSetting(`${context.command}.channelRestriction`);
            if (channelDisable?.indexOf(context.channel.id) > -1 || channelRestriction?.indexOf(context.channel.id) === -1) {
               if(context.interaction){
                   context.replyLang({ephemeral: true, content: "GENERIC_CHANNEL_DISABLED"}, {command: context.command});
               } else if (context.getBool("sendDisabledMessage")) {
                    const dm = await context.author.createDM();
                    dm.send(`${context.command} is disabled in that channel`);
                    //TODO: COMMAND_DISABLED_CHANNEL
                    this.bot.logger.log(`${context.command} is disabled in that channel (${context.channel.id})`);
                }
                return false;
            }
            return true;
        });

    },
};