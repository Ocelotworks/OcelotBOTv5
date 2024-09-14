/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 04/02/2019
 * ╚════ ║   (ocelotbotv5) music
 *  ════╝
 */
const Command = require("../util/Command");

const byebyeMessage = `
Sorry, the music command has been removed.
YouTube has been more aggressively fighting streaming bots like this, and unfortunately I don't have the time or funds to continuously fight to keep it working.
On top of that, Discord bans bots which are found to have music streaming from YouTube so the bot was at risk of being removed entirely.  
`
module.exports = class Music extends Command {
    name = "Music"
    usage = "music :command+"
    categories = ["music"]
    commands = ["music", "m"]
    handleError(context){
        return context.send({content: byebyeMessage})
    }
    run(context) {
        return context.send({content: byebyeMessage})
    }
};