module.exports = {
    name: "Give Points",
    usage: "givePoints :@user :0amount",
    commands: ["givepoints", "points"],
    noCustom: true,
    run: async function (context, bot) {
        let target = await bot.client.users.fetch(context.options.user);
        let amount = context.options.amount;
        let newAmount = await bot.database.addPoints(target, amount, `admin add ${context.user.id}`);
        context.send(`<@${target}> now has <:points:817100139603820614>${newAmount.toLocaleString()}`)
    }
};