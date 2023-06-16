module.exports = (context, bot)=> {
    if(context.commandData.categories.indexOf("nsfw") === -1)
        return true;
    const packs = context.getConfig("commands.guildPacks");
    if(!packs.includes("music")){
        bot.logger.log("Enabling nsfw pack for this server");
        bot.config.set(context.guild.id, "commands.guildPacks", packs+",nsfw");
    }
    return true
}