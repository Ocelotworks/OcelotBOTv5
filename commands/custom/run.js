module.exports = {
    name: "Test Code",
    usage: "run :code+",
    commands: ["run", "test", "compile"],
    run: async function (context, bot) {
        let code = context.commandData.getCodeBlock(context)

        if(code.length === 0)
            return context.sendLang({content: "CUSTOM_CODE_AMBIGUOUS", ephemeral: true})

        return bot.util.runCustomFunction(code, context);
    }
}