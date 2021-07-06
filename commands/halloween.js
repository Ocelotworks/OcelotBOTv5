/**
 *   ╔════   Copyright 2018 Peter Maguire
 *  ║ ════╗  Created 29/11/2018
 * ╚════ ║   (ocelotbotv5) halloween
 *  ════╝
 */
const halloween = new Date("31 October 2021");
module.exports = {
    name: "Halloween Countdown",
    usage: "halloween",
    detailedHelp: "Countdown to halloween",
    usageExample: "halloween",
    responseExample: "👻 251 days, 11 hours, 7 minutes and 41 seconds until halloween!",
    categories: ["tools"],
    commands: ["halloween"],
    run: function run(context, bot) {
        const diff = (halloween-(new Date()))/1000;
        return context.replyLang("HALLOWEEN", {time: bot.util.prettySeconds(diff, context.guild?.id, context.user.id)});
    }

};