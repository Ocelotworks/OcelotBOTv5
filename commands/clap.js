/**
 *   ╔════   Copyright 2018 Peter Maguire
 *  ║ ════╗  Created 03/12/2018
 * ╚════ ║   (ocelotbotv5) clap
 *  ════╝
 */
module.exports = {
    name: "Clap Text",
    usage: "clap :text+",
    categories: ["memes"],
    rateLimit: 10,
    detailedHelp: "Puts clap emojis in between the text you input.",
    usageExample: "clap Get OcelotBOT Today",
    responseExample: "Get👏OcelotBOT👏Today",
    commands: ["clap", "claptext"],
    run: function run(context) {
        return context.send(context.options.text.replace(/ /g, context.getSetting("clap.emoji")))
    },
};