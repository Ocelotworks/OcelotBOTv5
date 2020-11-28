/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 24/04/2019
 * ╚════ ║   (ocelotbotv5) firetext
 *  ════╝
 */
module.exports = {
    name: "Fire Text Generator",
    usage: "firetext <text>",
    categories: ["text"],
    detailedHelp: "Makes some super cool fire text",
    requiredPermissions: ["EMBED_LINKS"],
    commands: ["firetext", "fire"],
    run: function(message, args, bot){
        bot.util.coolTextGenerator(message,args,bot, {
            LogoID: 4,
            FontSize: 70,
            Color1_color: "#FF0000",
            Integer1: 15,
            Boolean1: "on",
            Integer9: 0,
            Integer13: "on",
            Integer12: "on",
            BackgroundColor_color: "#FFFFFF"
        });
    }
};