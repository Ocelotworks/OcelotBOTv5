/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 17/03/2019
 * ╚════ ║   (ocelotbotv5) zalgo
 *  ════╝
 */
module.exports = {
    name: "Zalgo Text",
    usage: "zalgo :text+",
    commands: ["zalgo"],
    categories: ["text"],
    run: async function (context, bot) {
        return context.send(context.options.text.zalgo);
    }
};