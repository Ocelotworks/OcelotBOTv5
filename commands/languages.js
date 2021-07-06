module.exports = {
    name: "Available Languages",
    usage: "languages [contribute?:contribute]",
    usageExample: "languages",
    detailedHelp: "View the available OcelotBOT languages",
    commands: ["lang", "languages", "language"],
    categories: ["meta"],
    run: async function(context, bot){
        if(context.options.contribute){
            return context.send(`If you'd like to contribute, send a DM to **Big P#1843** with the language you want to translate to. For contribution, you get a ${context.getSetting("prefix")}profile badge.`);
        }
        let output = await bot.lang.getTranslation(context.guild ? context.guild.id : "322032568558026753", "LANGUAGE_AVAILABLE")+"\n";
        const totalStrings = Object.keys(bot.lang.strings.default).length;
        for(let i in bot.lang.strings){
            const strings = bot.lang.strings[i];
            if(strings.LANGUAGE_HIDDEN)continue;
            if(i === "default")continue;
            const length = strings.LANGUAGE_GENERATED ? totalStrings : Object.keys(strings).length;
            output += `\`${i}\` - ${strings.LANGUAGE_FLAG} ${strings.LANGUAGE_NAME} - **${parseInt((length/totalStrings)*100)}% Translated**\n`;
        }

        return context.send({content: output, components: [bot.util.actionRow(bot.interactions.suggestedCommand(context, "contribute"))]});
    }
};