module.exports = {
    name: "Available Languages",
    usage: "languages",
    commands: ["lang", "languages", "language"],
    categories: ["meta"],
    run: async function(message, args, bot){
        if(args[1] && args[1].toLowerCase() === "contribute"){
            message.channel.send("Language contribution is current disabled, sorry!");
            return;
        }
        let output = await bot.lang.getTranslation(message.guild ? message.guild.id : "322032568558026753", "LANGUAGE_AVAILABLE")+"\n";
        const totalStrings = Object.keys(bot.lang.strings.default).length;
        for(let i in bot.lang.strings){
            const strings = bot.lang.strings[i];
            const length = Object.keys(strings).length;
            output += `\`${i}\` - ${strings.LANGUAGE_FLAG} ${strings.LANGUAGE_NAME} - **${parseInt((length/totalStrings)*100)}% Translated**\n`;
        }

        message.channel.send(output);
    }
};