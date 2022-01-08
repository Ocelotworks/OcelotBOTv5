const {CustomCommandContext} = require("../util/CommandContext");
module.exports = {
    type: "command",
    run: async function(context, response, bot){
        let message = context.message || await context.channel.messages.fetch({limit: 1}).then((m)=>m.first())
        const syntheticContext = new CustomCommandContext(bot, message, response);
        return bot.command.runCommand(bot.command.initContext(syntheticContext));
    }
}