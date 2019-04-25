/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 24/04/2019
 * ╚════ ║   (ocelotbotv5) createPremiumKey
 *  ════╝
 */
module.exports = {
    name: "Create Premium Key",
    usage: "createpremiumkey",
    commands: ["cpk", "createpremiumkey", "premiumkey"],
    run: async function(message, args, bot){
        let key = await bot.database.createPremiumKey(message.author.id);
        message.channel.send(`Premium key: \`${key}\``);
    }
};