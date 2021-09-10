module.exports = (context, bot) => {
    if(!context.guild)return true;
    if (context.getSetting("notice")) {
        context.send(context.getSetting("notice"));
        bot.database.deleteSetting(context.guild.id, "notice");
        if (bot.config.cache[context.guild.id])
            bot.config.cache[context.guild.id].notice = null;
    }
    return true;
}