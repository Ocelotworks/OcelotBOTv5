/**
 * Created by Peter on 01/07/2017.
 */

module.exports = {
    name: "Urban Dictionary",
    usage: "defineud :term+",
    categories: ["tools", "fun"],
    detailedHelp: "Find the urban definition of a word",
    usageExample: "defineud peng",
    responseExample: "Definition for **peng**: \nA very [positive] word used casualy [to show] how [attracted] etc you are to something/someone",
    commands: ["defineud", "ud", "urban", "urbandictionary"],
    run: async function run(context, bot) {
        const term = context.options.term;
        let data = await bot.util.getJson(`http://api.urbandictionary.com/v0/define?term=${term}`);
        if(data && data.list && data.list.length > 0) {
            let hasPermission;
            if (!context.guild)
                hasPermission = true;
            else {
                const permissions = await context.channel.permissionsFor(bot.client.user);
                hasPermission = permissions.has(["ADD_REACTIONS", "MANAGE_MESSAGES"])
            }
            if (hasPermission) {
                await bot.util.standardPagination(context.channel, data.list, async function (page) {
                    page.definition = page.definition.substring(0, 800);
                    page.example = page.example.substring(0, 800);
                    return bot.lang.getTranslation(context.guild ? context.guild.id : "322032568558026753", "UD_DEFINITION", page);
                }, true);
            } else {
                bot.logger.log(`Channel ${context.channel.id} (${context.channel.name} in ${context.channel.guild.name}) doesn't allow MANAGE_MESSAGES or ADD_REACTIONS`);
                const entry = data.list[0];
                context.replyLang("UD_DEFINITION", {
                    word: entry.word,
                    definition: entry.definition.substring(0, 800),
                    example: entry.example.substring(0, 800)
                });
            }
        }else{
            context.replyLang("UD_NO_DEFINITIONS");
        }
    }
};