module.exports = {
    name: "Test Code",
    usage: "run <code>",
    commands: ["run", "test", "compile"],
    run: async function (message, args, bot) {
        // TODO: This is all very duplicated code and could do with being cleaned up
        let start = message.content.indexOf("```")
        let end = message.content.length - 4;
        if (start === -1) {
            start = args.slice(0, 2).join(" ").length+1;
            end = message.content.length;
        }else{
            start += 3
        }
        let code = message.content.substring(start, end);
        if(code.startsWith("lua"))code = code.substring(3); // Remove lua from the start of the codeblock

        if(code.length === 0){
            return message.channel.send(":warning: Couldn't figure out where your code starts. For the best results, enter your code inside of a codeblock (wrapped in ```)")
        }
        return bot.util.runCustomFunction(code, message);
    }
}