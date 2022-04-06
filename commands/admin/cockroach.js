const columnify = require('columnify');
module.exports = {
    name: "Run Cockroach SQL",
    usage: "csql :sql+",
    commands: ["csql", "cock", "cockroach"],
    noCustom: true,
    run: async function (context, bot) {
        let sql = context.options.sql;
        context.defer();
        try {
            let {rows: result} = await bot.database.knockroach.raw(sql);

            console.log(result);
            if (result?.[0]?.user) {
                for (let i = 0; i < result.length; i++) {
                    result[i].user = (await bot.util.getUserInfo(result[i].user)).tag;
                }
            }

            return context.send(`Host: \`${bot.database.knockroach.context.client.config.connection.host}\`\n\`\`\`\n${columnify(result)}\n\`\`\``);
        } catch (e) {
            return context.send(`Error:\n\`\`\`\n${e}\n\`\`\``);
        }
    }
};