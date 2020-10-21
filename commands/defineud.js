/**
 * Created by Peter on 01/07/2017.
 */

module.exports = {
    name: "Urban Dictionary",
    usage: "defineud <word>",
    categories: ["tools", "fun"],
    commands: ["defineud", "ud", "urban", "urbandictionary"],
    run: async function run(message, args, bot) {
        if(!args[1]){
            message.channel.send(`Usage: ${(message.guild && bot.prefixCache[message.guild.id]) || "!"}defineud <term>`);
            return;
        }
        const term = encodeURIComponent(args.slice(1).join(" "));
        let data = await bot.util.getJson(`http://api.urbandictionary.com/v0/define?term=${term}`);
        if(data && data.list && data.list.length > 0) {
            let hasPermission;
            if (!message.guild)
                hasPermission = true;
            else {
                const permissions = await message.channel.permissionsFor(bot.client.user);
                hasPermission = permissions.has(["ADD_REACTIONS", "MANAGE_MESSAGES"])
            }
            if (hasPermission) {
                await bot.util.standardPagination(message.channel, data.list, async function (page) {
                    page.definition = page.definition.substring(0, 800);
                    page.example = page.example.substring(0, 800);
                    return bot.lang.getTranslation(message.guild ? message.guild.id : "322032568558026753", "UD_DEFINITION", page);
                }, true);
            } else {
                bot.logger.log(`Channel ${message.channel.id} (${message.channel.name} in ${message.channel.guild.name}) doesn't allow MANAGE_MESSAGES or ADD_REACTIONS`);
                const entry = data.list[0];
                message.replyLang("UD_DEFINITION", {
                    word: entry.word,
                    definition: entry.definition.substring(0, 800),
                    example: entry.example.substring(0, 800)
                });
            }
        }else{
            message.replyLang("UD_NO_DEFINITIONS");
        }
    }
};