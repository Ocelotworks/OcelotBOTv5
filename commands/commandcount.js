/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 06/03/2019
 * ╚════ ║   (ocelotbotv5) commandcount
 *  ════╝
 */
module.exports = {
    name: "Command Count",
    usage: "commandcount",
    detailedHelp: "How many commands have been run on OcelotBOT so far?",
    categories: ["tools", "fun"],
    commands: ["commandcount"],
    run: async function run(message, args, bot) {
        let count = await bot.database.getCommandCount();
        message.replyLang("COMMANDCOUNT", {count: count[0]['MAX(id)'].toLocaleString()})
    }
};