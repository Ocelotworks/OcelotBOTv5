/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 03/05/2019
 * ╚════ ║   (ocelotbotv5) harrypotter
 *  ════╝
 */
const Image = require("../util/Image");
module.exports = {
    name: "Harry Potter Text Generator",
    usage: "potter :text+",
    categories: ["text"],
    detailedHelp: "Make harry potter text",
    usageExample: "harrypotter Hotel Porter",
    requiredPermissions: ["EMBED_LINKS"],
    commands: ["potter", "harrypotter"],
    run: Image.CooltextGenerator({
        "LogoID": 38,
        "FontSize": 70,
        "Boolean2": "on",
        "Integer5": 0,
        "Integer7": 0,
        "Integer8": 0,
        "Integer14_color": "#000000",
        "Integer6": 75,
        "Integer9": 0,
        "Integer13": "on",
        "Integer12": "on",
        "FileFormat": 5,
        "BackgroundColor_color": "#FFFFFF",
    }),
};