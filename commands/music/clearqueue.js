/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 04/09/2019
 * ╚════ ║   (ocelotbotv5) queue
 *  ════╝
 */
module.exports = {
    name: "Clear Queue",
    usage: "clearqueue",
    commands: ["clear", "cq", "clearqueue", "qc"],
    run: async function(message, args, bot, music){
        const guild = message.guild.id;
        if(!music.listeners[guild] || !music.listeners[guild].playing)
            return message.channel.send(`:warning: Nothing is currently playing! To play a song, type ${args[0]} queue <search or URL>`);

        const listener = music.listeners[guild];

        if(listener.queue.length === 0)
            return message.channel.send(`:spider_web: The queue is empty! Add some songs with ${args[0]} queue <search or URL>`);


        if(listener.voiceChannel.members.size > 2 )
            return message.channel.send(`:bangbang: You can only use this command if you're the only one listening.`);

        message.channel.send(`:white_check_mark: Cleared **${listener.queue.length}** items from the queue.`);
        listener.queue = [];
    }
};