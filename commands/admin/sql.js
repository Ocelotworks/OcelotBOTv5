/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 05/07/2019
 * ╚════ ║   (ocelotbotv5) sql
 *  ════╝
 */
const columnify = require('columnify');
module.exports = {
    name: "Run SQL",
    usage: "sql <sql>",
    commands: ["sql"],
    run:  async function(message, args, bot){
        let sql = message.content.substring(args[0].length+args[1].length+2);
        try {
            let result = await bot.database.knex.raw(sql);
            message.channel.send(`\`\`\`\n${columnify(result[0])}\n\`\`\``);
        }catch(e){
            message.channel.send(`Error:\n\`\`\`\n${e}\n\`\`\``);
        }
    }
};