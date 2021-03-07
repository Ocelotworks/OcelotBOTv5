const axios = require('axios');
module.exports = {
    name: "Run Lua",
    usage: "lua <code>",
    commands: ["lua", "runlua"],
    run: async function (message, args, bot) {
        let start = message.content.indexOf("\n```lua\n") + 8
        let end = message.content.length - 4;
        if (start === -1) {
            start = args[0].length + args[1].length + 2;
            end = message.content.length;
        }
        let code = message.content.substring(start, end);
        return message.channel.send((await bot.util.runCustomFunction(code, message)).output)
    }
}