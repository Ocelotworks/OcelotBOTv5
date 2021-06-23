module.exports = {
    name: "Test Code",
    usage: "run :code+",
    commands: ["run", "test", "compile"],
    run: async function (context, bot) {
        // TODO: This is all very duplicated code and could do with being cleaned up
        let code = context.commandData.getCodeBlock(context)

        if(code.length === 0)
            return context.send({content: ":warning: Couldn't figure out where your code starts. For the best results, enter your code inside of a codeblock (wrapped in ```)", ephemeral: true})

        return bot.util.runCustomFunction(code, context.message);
    }
}