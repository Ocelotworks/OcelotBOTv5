module.exports = (context, bot)=> {

    if(context.getBool(`${context.command}.disable`)) {
        bot.logger.log(`${context.command} is disabled in this server.`)
        return false;
    }

    if(context.options.command && context.getBool(`${context.command}.${context.options.command}.disable`)){
        bot.logger.log(`${context.command} ${context.options.command} is disabled in this server.`)
        context.options.command = "help";
        return true;
    }

    if (context.getSetting(`${context.command}.override`)) {
        context.send(context.getSetting(`${context.command}.override`));
        return false;
    }

    if(context.options.command && context.getSetting(`${context.command}.${context.options.command}.override`)){
        context.send(context.getSetting(`${context.command}.${context.options.command}.override`));
        return false;
    }
    return true;
};