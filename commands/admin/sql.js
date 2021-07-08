/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 05/07/2019
 * ╚════ ║   (ocelotbotv5) sql
 *  ════╝
 */
const columnify = require('columnify');
module.exports = {
    name: "Run SQL",
    usage: "sql :sql+",
    commands: ["sql"],
    noCustom: true,
    run: async function (context, bot) {
        let sql = context.options.sql;
        context.defer();
        try {
            let result = await bot.database.knex.raw(sql);

            if (result[0] && result[0][0] && result[0][0].user) {
                for (let i = 0; i < result[0].length; i++) {
                    result[0][i].user = (await bot.util.getUserInfo(result[0][i].user)).tag;
                }
            }

            return context.send(`\`\`\`\n${columnify(result[0])}\n\`\`\``);
        } catch (e) {
            return context.send(`Error:\n\`\`\`\n${e}\n\`\`\``);
        }
    }
};