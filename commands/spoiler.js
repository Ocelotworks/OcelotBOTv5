/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 27/02/2019
 * ╚════ ║   (ocelotbotv5) spoiler
 *  ════╝
 */
module.exports = {
    name: "Spoilerise Text",
    usage: "spoiler :text+",
    detailedHelp: "Puts spoiler tags around every single letter in a word",
    usageHelp: "spoiler darth vader is lukes father",
    categories: ["text"],
    rateLimit: 10,
    commands: ["spoiler", "spoilerise", "spoilerize"],
    run: function run(context) {
        return context.send(`||${[...(context.options.text.substring(0, 400))].join("||||")}||`)
    }
};