/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 04/02/2019
 * ╚════ ║   (ocelotbotv5) queue
 *  ════╝
 */
module.exports = {
    name: "Queue Song",
    usage: "queue <url>",
    commands: ["queue", "play", "add", "q"],
    run: async function(message, args, bot, music){
        if(!args[2]){
            message.channel.send(`:warning: Invalid usage. You must add an URL to queue. ${args[0]} ${args[1]} <url>`);
        }else{
            let query = message.cleanContent.substring(args[0].length+args[1].length+2);
            let guild = message.guild.id;
            if(!music.listeners[guild]){
                if(!message.member.voiceChannel)
                    return message.channel.send(":warning: You have to be in a voice channel to use this command.");

                let connection = await message.member.voiceChannel.join();
                music.listeners[guild] = {
                    connection: connection,
                    queue: [],
                    server: guild,
                    channel: message.channel,
                    playing: null
                };

            }
            let song = await music.addToQueue(guild, query);
            message.channel.send(`:white_check_mark: Added **${song.author} - ${song.title}** to the queue.`);



        }

    }
};