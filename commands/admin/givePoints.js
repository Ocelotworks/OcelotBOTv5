module.exports = {
    name: "Give Points",
    usage: "givePoints :@user :0amount",
    commands: ["givepoints", "points"],
    noCustom: true,
    slashHidden: true,
    run: async function (context, bot) {
        let amount = context.options.amount;
        let newAmount = await bot.database.addPoints(context.options.user, amount, `admin add ${context.user.id}`);
        return context.send(`<@${context.options.user}> now has <:points:817100139603820614>${newAmount.toLocaleString()}`)
    }
};