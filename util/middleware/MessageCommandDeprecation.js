module.exports = (context, bot) => {
    if (!context.getBool("messageCommandDeprecation") || context.interaction || !context.message)return true;
    context.appendResponsePrefix(context.getLang("MESSAGE_COMMAND_DEPRECATION"));
    return true;
}