/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 27/01/2019
 * ╚════ ║   (ocelotbotv5) error
 *  ════╝
 */
const Discord = require('discord.js');
module.exports = {
    name: "Error Message Generator",
    usage: "error <message>",
    commands: ["error", "errormessage"],
    categories: ["image"],
    requiredPermissions: ["ATTACH_FILES"],
    run: function run(message, args) {
        if(args.length < 2)
            return message.replyLang("GENERIC_TEXT", {command: args[0]});
        const content = message.cleanContent.substring(args[0].length+1);
        let attachment = new Discord.Attachment(`http://atom.smasher.org/error/98.png.php?style=98&title=Error&url=&text=${encodeURIComponent(content)}&b1=&b2=OK&b3=`, "error.png");
        message.channel.send("", attachment);
    }
};