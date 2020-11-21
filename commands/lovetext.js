/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 24/04/2019
 * ╚════ ║   (ocelotbotv5) lovetext
 *  ════╝
 */
module.exports = {
    name: "Love Text Generator",
    usage: "lovetext <text>",
    categories: ["text"],
    requiredPermissions: ["EMBED_LINKS"],
    commands: ["lovetext", "love"],
    run:  function(message, args, bot){
        bot.util.coolTextGenerator(message,args,bot, {
            "LogoID": 819721038,
            "FontSize": 70,
            "Color1_color": "#c31870",
            "Color2_color": "#FFFFFF",
            "Color3_color": "#b71268",
            "Integer9": 0,
            "Integer13": "on",
            "Integer12": "on",
            "BackgroundColor_color": "#FFFFF"
        });
    }
};