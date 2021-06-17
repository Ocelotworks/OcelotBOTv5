/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 27/02/2019
 * ╚════ ║   (ocelotbotv5) spoiler
 *  ════╝
 */
module.exports = {
    name: "Spoilerise Text",
    usage: "spoiler :text+",
    categories: ["text"],
    rateLimit: 10,
    commands: ["spoiler", "spoilerise", "spoilerize"],
    run: function run(context) {
        return context.send(`||${[...context.options.text].join("||||")}||`)
    }
};