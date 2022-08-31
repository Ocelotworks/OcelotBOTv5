module.exports = (context, bot)=> {
    if(getCommandScopedBool(context, "override")) {
        bot.logger.log(`${context.command} ${context.options.command || ""} is disabled in this server.`)
        if(context.options.command){
            context.options.command = "help";
            return true;
        }
        return false;
    }

    if (getCommandScopedSetting(context, "override")) {
        context.send(getCommandScopedSetting(context, "override"));
        return false;
    }

    if (getCommandScopedSetting(context, "notice")) {
        context.appendResponsePrefix(getCommandScopedSetting(context, "notice"));
        return true;
    }

    return true;
};

function getCommandScope(context){
    let scopedCommand = context.command;
    if(context.options.command)
        scopedCommand += "."+context.options.command;
    return scopedCommand;
}

function getCommandScopedSetting(context, setting){
    const scopedCommand = getCommandScope(context);
    return context.getSetting(`${scopedCommand}.${setting}`) || context.getSetting(`${context.command}.${setting}`);
}

function getCommandScopedBool(context, setting){
    const scopedCommand = getCommandScope(context);
    return context.getBool(`${scopedCommand}.${setting}`) || context.getBool(`${context.command}.${setting}`);
}