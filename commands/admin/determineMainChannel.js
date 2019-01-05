/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 04/01/2019
 * ╚════ ║   (ocelotbotv5) determineMainChannel
 *  ════╝
 */
module.exports = {
    name: "Determine Main Channel",
    usage: "determineMainChannel",
    commands: ["determinemainchannel"],
    run: async function(message, args, bot){
        let mainChannel = bot.util.determineMainChannel(message.guild);
        if(mainChannel){
            message.channel.send("Determined main channel to be "+mainChannel);
        }else{
            message.channel.send("No eligible channels.");
        }
    }
};