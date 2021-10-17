const Discord = require("discord.js");
module.exports = {
    name: "Eval Script Locally",
    usage: "evallocal :script+",
    commands: ["evallocal"],
    noCustom: true,
    run: async function (context, bot) {
        try {
            let result = eval(context.options.script);
            let dataType = "";
            if(result === undefined || result === null)result = ""+result;
            if(typeof result === "object"){
                dataType = "json";
                result = JSON.stringify(result, null, 1);
            }else if(typeof result === "function"){
                dataType = "js";
                result = result.toString();
            }
            let output = `\`\`\`${dataType}\n${result}\n\`\`\``
            if(output.length > 2000)
                return context.send({files: [new Discord.MessageAttachment(Buffer.from(result), "eval."+(dataType || "txt"))]})
            return context.send(output);
        } catch (e) {
            return context.send("Error\n```js\n" + e + "\n```");
        }
    }
};