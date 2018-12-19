/**
 *   ╔════   Copyright 2018 Peter Maguire
 *  ║ ════╗  Created 19/12/2018
 * ╚════ ║   (ocelotbotv5) testCockup
 *  ════╝
 */
module.exports = {
    name: "Test Cockup",
    usage: "cockup",
    commands: ["cockup"],
    run:  function(message, args, bot){
        const content = message.content.substring(message.content.indexOf(args[2]));
        bot.client.shard.send({type: "cockup", payload: content});
        message.channel.send("Sent test cockup");
    }
};