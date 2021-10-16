const columnify = require("columnify");

module.exports = {
    name: "Transaction Log",
    usage: "transactions",
    commands: ["transactions", "history", "log"],
    run: async function (context, bot) {
        let transactions = await bot.database.getLastPointsTransactions(context.user.id);
        if(transactions.length === 0)
            return context.sendLang({content: "POINTS_TRANSACTIONS_NONE", ephemeral: true});

        return context.sendLang({content: "POINTS_TRANSACTIONS"}, {
            transactions: columnify(transactions.reverse().map((t)=>({"#": t.amount < 0 ? "-" : "+", date: t.timestamp.toLocaleString(), origin: t.origin, amount: Math.abs(t.amount)})))
        });
    }
};