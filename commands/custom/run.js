module.exports = {
    name: "Test Code",
    usage: "run [language?:lua,js] :code+",
    commands: ["run", "test", "compile"],
    run: async function (context, bot) {
        let {code, language} = context.commandData.getCodeBlock(context)
        const actualLanguage = context.options.language || language || "lua";

        console.log(code, language);
        if(code.length === 0)
            return context.sendLang({content: "CUSTOM_CODE_AMBIGUOUS", ephemeral: true})

        return bot.util.runCustomFunction(code, context, actualLanguage);
    }
}