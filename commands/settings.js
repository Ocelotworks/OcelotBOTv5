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
        // Disable if disableNSFW is turned on
        bot.addCommandMiddleware(async (context)=>{
            if (context.getBool("disableNSFW") && context.commandData.categories.indexOf("nsfw") > -1) {
                if(context.interaction){
                    context.replyLang({ephemeral: true, content: "GENERIC_CHANNEL_DISABLED"}, {command: context.command});
                    return false;
                }
                const dm = await context.user.createDM();
                dm.send(`NSFW commands are disabled in this server.`);
                bot.logger.log(`NSFW commands are disabled in this server (${context.guild.id}): ${context}`);
                return false;
            }
            return true;
        });

        bot.addCommandMiddleware(async (context)=>{
            if(!context.guild || !context.member || !context.getSetting("commands.role") || context.getSetting("commands.role").toLowerCase() === "clear")return true;
            if(context.member.roles.cache.has(context.getSetting("commands.role")))return true;
            bot.logger.log(`User does not have required role to use this command (${context.getSetting("commands.role")})`);
            return false;
        });

        // Disable commands that are disabled
        bot.addCommandMiddleware((context)=>{
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
            if(context.interaction && !context.interaction.options)return true;
            let content = context.message ? context.message.content : context.interaction.options?.map?.((o)=>o.value).join(" ");
            if (content && bot.util.swearRegex.exec(content)) {
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
                    const dm = await context.user.createDM();
                    dm.send(`${context.command} is disabled in that channel`);
                    //TODO: COMMAND_DISABLED_CHANNEL
                    bot.logger.log(`${context.command} is disabled in that channel (${context.channel.id})`);
                }
                return false;
            }
            return true;
        });

    },
};