/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 06/09/2019
 * ╚════ ║   (ocelotbotv5) autodj
 *  ════╝
 */
module.exports = {
    name: "Toggle AutoDJ",
    usage: "autodj",
    commands: ["autodj", "autoplay", "dj", "auto"],
    run: async function (message, args, bot, music) {
        let guild = message.guild.id;
        if (!music.listeners[guild]) {
            if (!message.member.voice.channel)
                return message.channel.send(":warning: You have to be in a voice channel to use this command.");
            await music.constructListener(message.guild, message.member.voice.channel, message.channel);
        }

        //if(music.listeners[guild].host !== "boywanders.us")
        //    return message.channel.send("AutoDJ cannot currently be used due to high traffic, please try again later.");
        // noinspection JSAssignmentUsedAsCondition
        if (music.listeners[guild].autodj = !music.listeners[guild].autodj) {
            message.channel.send(":robot: AutoDJ **Enabled**. Songs will be played automatically until a song is queued or everyone leaves.");
        } else {
            message.channel.send(":robot: AutoDJ **Disabled** When the queue is empty the bot will leave after 1 minute of inactivity.");
        }
        if (!music.listeners[guild].playing)
            music.playNextInQueue(guild);
    }
};