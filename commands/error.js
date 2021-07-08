/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 27/01/2019
 * ╚════ ║   (ocelotbotv5) error
 *  ════╝
 */
module.exports = {
    name: "Error Message Generator",
    usage: "error :message+",
    detailedHelp: "Make a windows 98 error message",
    usageExample: "error Unable to can.",
    commands: ["error", "errormessage"],
    categories: ["image"],
    run: function run(context) {
        return context.send(`http://atom.smasher.org/error/98.png.php?style=98&title=Error&url=&text=${encodeURIComponent(context.options.message)}&b1=&b2=OK&b3=`)
    }
};