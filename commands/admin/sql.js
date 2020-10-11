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

            if(result[0] && result[0][0] && result[0][0].user){
                for(let i = 0; i < result[0].length; i++){
                    result[0][i].user = (await bot.util.getUserInfo(result[0][i].user)).tag;
                }
            }

            message.channel.send(`\`\`\`\n${columnify(result[0])}\n\`\`\``);
        }catch(e){
            message.channel.send(`Error:\n\`\`\`\n${e}\n\`\`\``);
        }
    }
};