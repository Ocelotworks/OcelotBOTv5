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
    detailedHelp: "Make a windows 98 error message",
    usageExample: "error Unable to can.",
    commands: ["error", "errormessage"],
    categories: ["image"],
    requiredPermissions: ["ATTACH_FILES"],
    slashOptions: [
        {type: "STRING", name: "message", description: "The error message", required: true},
        {type: "STRING", name: "title", description: "The error title", required: false},
    ],
    run: function run(message, args) {
        if (args.length < 2)
            return message.replyLang("GENERIC_TEXT", {command: args[0]});
        const content = message.cleanContent.substring(args[0].length + 1);
        let attachment = new Discord.MessageAttachment(`http://atom.smasher.org/error/98.png.php?style=98&title=Error&url=&text=${encodeURIComponent(content)}&b1=&b2=OK&b3=`, "error.png");
        return message.channel.send({files: [attachment]});
    },
    runSlash: function(interaction){
        return interaction.reply(`http://atom.smasher.org/error/98.png.php?style=98&title=${encodeURIComponent(interaction.options.get("title")?.value || "Error")}&url=&text=${encodeURIComponent(interaction.options.get("message").value)}&b1=&b2=OK&b3=`)
    }

};