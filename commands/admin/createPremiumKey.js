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
    noCustom: true,
    run: async function (context, bot) {
        let key = await bot.database.createPremiumKey(context.user.id);
        context.send(`Premium key: \`${key}\``);
    }
};