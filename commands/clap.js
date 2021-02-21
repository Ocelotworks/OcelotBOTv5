/**
 *   ╔════   Copyright 2018 Peter Maguire
 *  ║ ════╗  Created 03/12/2018
 * ╚════ ║   (ocelotbotv5) clap
 *  ════╝
 */
module.exports = {
    name: "Clap Text",
    usage: "clap <text>",
    categories: ["memes"],
    rateLimit: 10,
    detailedHelp: "Puts clap emojis in between the text you input.",
    usageExample: "clap Get OcelotBOT Today",
    responseExample: "Get👏OcelotBOT👏Today",
    commands: ["clap", "claptext"],
    run: function run(message, args, bot) {
       if(!args[1]){
            return message.replyLang("GENERIC_TEXT", {command: args[0]})
       }else{
           message.channel.send(message.content.substring(message.content.indexOf(args[1])).replace(/ /g, message.getSetting("clap.emoji")))
       }
    },
    test: function(test) {
        test('clap no text', function (t) {
            const args = ["clap"];
            const message = {
                replyLang: function (message) {
                    t.is(message, "GENERIC_TEXT")
                }
            };
            module.exports.run(message, args);
        });
    }
};