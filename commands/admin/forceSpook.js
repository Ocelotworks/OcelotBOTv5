module.exports = {
    name: "Force Spook",
    usage: "forceSpook <user>",
    commands: ["forcespook"],
    run: async function (message, args, bot) {
        const target = message.mentions.users.first();
        const result = await bot.database.getSpookCount(target.id, message.guild.id);
        let count = result[0]['COUNT(*)'] + 1;
        message.replyLang("SPOOK", {
            count: bot.util.getNumberPrefix(count),
            spooked: target.id
        });
        await bot.spook.createSpook(message.channel, message.author, target);
    }
};