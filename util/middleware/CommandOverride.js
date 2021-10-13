module.exports = (context, bot)=> {

    if(context.getBool(`${context.command}.disable`)) {
        bot.logger.log(`${context.command} is disabled in this server.`)
        return false;
    }

    if (context.getSetting(`${context.command}.override`)) {
        context.send(context.getSetting(`${context.command}.override`));
        return false;
    }
    return true;
};