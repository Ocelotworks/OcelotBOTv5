module.exports = {
    name: "Give Points",
    usage: "givePoints",
    commands: ["givepoints", "points"],
    noCustom: true,
    run: async function (message, args, bot) {
        let target;
        let amount = parseInt(args[3]);
        if (isNaN(amount))
            return message.channel.send("Usage: !admin givePoints @user amount");
        if (!message.mentions.users.first()) {
            target = args[2];
        } else {
            target = message.mentions.users.first().id;
        }

        let newAmount = await bot.database.addPoints(target, amount, `admin add ${message.author.id}`);
        message.channel.send(`<@${target}> now has <:points:817100139603820614>${newAmount.toLocaleString()}`)
    }
};