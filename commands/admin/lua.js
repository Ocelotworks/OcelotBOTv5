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
        console.log(message.content);
        console.log(code)
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        try {
            let result = await axios.post("https://ob-custom-commands.d.int.unacc.eu/run", {
                script: code, message: bot.util.serialiseMessage(message)
            })

            if (result.data.content)
                return message.channel.send(result.data.content);

            return message.channel.send(`Custom command returned an error:\n\`\`\`json\n${JSON.stringify(result.data, null, 1)}\n\`\`\``)
        } catch (e) {
            return message.channel.send(`Custom command returned an error:\n\`\`\`\n${e.message}\n${e.response ? JSON.stringify(e.response.data) : ""}\n\`\`\``)
        }
    }
}