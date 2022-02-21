let seenMessage = {};
module.exports = (context, bot) => {
    if(!context.getBool("messageCommandDeprecation") || context.interaction || !context.message)return true;
    const key = context.interaction || !context.message;
    seenMessage[key] = seenMessage[key]+1 || 0;
    if (seenMessage[key] && seenMessage[key] < 50)return true;
    seenMessage[key] = 0;
    context.appendResponsePrefix(context.getLang("MESSAGE_COMMAND_DEPRECATION"));
    return true;
}