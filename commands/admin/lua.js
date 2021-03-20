const axios = require('axios');
module.exports = {
    name: "Run Lua",
    usage: "lua <code>",
    commands: ["lua", "runlua"],
    run: async function (message, args, bot) {
        let start = message.content.indexOf("```lua")
        let end = message.content.length - 4;
        if (start === -1) {
            start = args.slice(0, 3).join(" ").length+1;
            end = message.content.length;
        }else{
            start += 6
        }
        let code = message.content.substring(start, end);
        return bot.util.runCustomFunction(code, message);
    }
}