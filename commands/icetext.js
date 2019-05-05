/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 24/04/2019
 * ╚════ ║   (ocelotbotv5) icetext
 *  ════╝
 */
module.exports = {
    name: "Ice Text Generator",
    usage: "icetext <text>",
    categories: ["text"],
    requiredPermissions: ["EMBED_LINKS"],
    commands: ["icetext", "ice"],
    run:  function(message, args, bot){
        bot.util.coolTextGenerator(message,args,bot, {
            LogoID: 1779834160,
            FontSize: 70,
            FileFormat: 6,
            BackgroundColor_color: "#FFFFFF"
        });
    }
};