/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 24/04/2019
 * ╚════ ║   (ocelotbotv5) icetext
 *  ════╝
 */
const Image = require("../util/Image");
module.exports = {
    name: "Ice Text Generator",
    usage: "icetext :text+",
    categories: ["text"],
    detailedHelp: "Ice text font",
    requiredPermissions: ["EMBED_LINKS"],
    commands: ["icetext", "ice"],
    slashCategory: "images",
    run: Image.CooltextGenerator({
        LogoID: 1779834160,
        FontSize: 70,
        FileFormat: 6,
        BackgroundColor_color: "#FFFFFF"
    }),
};