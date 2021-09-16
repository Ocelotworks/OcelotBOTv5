const {CustomCommandContext} = require("../util/CommandContext");
const blacklistedSettings = ["premium", "serverPremium", "admin", "ocelotworks"];
module.exports = {
    type: "command",
    run: function(message, response, bot){
        const syntheticContext = new CustomCommandContext(bot, message, response);
        return bot.command.runCommand(bot.command.initContext(syntheticContext));
    }
}