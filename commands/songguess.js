/**
 *   ╔════   Copyright 2018 Peter Maguire
 *  ║ ════╗  Created 05/12/2018
 * ╚════ ║   (ocelotbotv5) songguess
 *  ════╝
 */

let songList = [];
let count = 0;
const path = "/home/peter/nsp";
const config = require('config');
const request = require('request');
const Discord = require('discord.js');
const columnify = require('columnify');
const pasync = require('promise-async');
const fs = require('fs');

module.exports = {
    name: "Guess The Song",
    usage: "guess [stop/stats/leaderboard]",
    rateLimit: 25,
    categories: ["games", "voice"],
    requiredPermissions: ["CONNECT", "SPEAK"],
    commands: ["guess", "guesssong", "songguess", "namethattune", "quess", "gues"],
    init: async function init(bot){

        bot.voiceLeaveTimeouts = {};

        bot.logger.log("Loading song list...");

        songList = await bot.database.getSongList();

        process.on('message', async function(message){
            if(message.type === "destruct"){
                bot.logger.log("Shutting down running guess games");
                let keys = Object.keys(runningGames);
                for(let i = 0; i < keys.length; i++){
                    bot.logger.log("Shutting down running guess game "+keys[i]);
                    let {player} = runningGames[keys[i]];
                    await player.seek(100000);
                    await player.leave();
                    await player.destroy();
                }}
        });
    },
    run:  async function run(message, args, bot){
        if(args[1] && args[1].toLowerCase() === "stop") {
            if (message.member.voiceChannel && runningGames[message.member.voiceChannel.id]) {
                await runningGames[message.member.voiceChannel.id].collector.stop();
            }else{
                message.channel.send(":warning: You are not currently in a voice channel that is playing guess!");
            }
        }else if(args[1] && args[1].toLowerCase() === "stats") {
            let stats = await bot.database.getGuessStats();
            let output = "**Guess Stats:**\n";
            output += `**${songList.length.toLocaleString()}** available songs.\n`;
            output += `**${stats.totalGuesses.toLocaleString()}** total guesses by **${stats.totalUsers}** users.\n`;
            output += `**${stats.totalCorrect.toLocaleString()}** (**${parseInt((stats.totalCorrect / stats.totalGuesses) * 100)}%**) correct guesses.\n`;
            output += `Average of **${bot.util.prettySeconds(stats.averageTime / 1000)}** until a correct guess.\n`;
            output += `**${bot.util.prettySeconds(stats.totalTime / 1000)}** spent guessing in total.\n`;
            message.channel.send(output);
        }else if(args[1] && args[1].toLowerCase() === "leaderboard"){

            let leaderboardData;
            if(args[2] && args[2].toLowerCase() === "monthly"){
                leaderboardData = await bot.database.getGuessMonthlyLeaderboard();
            }else if(args[2] && args[2].toLowerCase() === "server" && message.guild) {
                leaderboardData = await bot.database.getGuessServerLeaderboard(message.guild.members.keyArray());
            }else{
                leaderboardData = await bot.database.getGuessLeaderboard();
            }

            const unknownUserKey = await bot.lang.getTranslation(message.guild ? message.guild.id : "322032568558026753", "TRIVIA_UNKNOWN_USER");
            let i = 0;
            let data = [];
            let position = -1;

            await pasync.eachSeries(leaderboardData, async function processLeaderboard(entry, cb){
                i++;
                if(entry.user === message.author.id){
                    position = "#"+i;
                    if(i > 10){
                        cb();
                        return;
                    }
                }
                if(i <= 10)
                    try {
                        let user = bot.client.users.get(entry.user);
                        if(!user)
                            user = await bot.util.getUserInfo(entry.user);
                        data.push({
                            "#": i,
                            "user": user ? `${user.username}#${user.discriminator}` : `${unknownUserKey} ${entry.user}`,
                            "Correct": entry.points,
                            "Total": entry.total,
                        });
                    }catch(e){
                        bot.logger.error("Error processing leaderboard entry");
                        bot.logger.error(e);
                    }finally{
                        cb();
                    }
                else cb();
            });
            message.channel.send(`You are **${position}** out of **${leaderboardData.length}** total players${args[2] && args[2].toLowerCase() === "monthly" ? " this month." : "."}\n\`\`\`yaml\n${columnify(data)}\n\`\`\``);
        }else if(songList.length === 0){
            message.channel.send("OcelotBOT is currently in a limited functionality mode, which disables this command.");
        }else if(!message.guild){
            message.replyLang("GENERIC_DM_CHANNEL");
        }else if(!message.guild.available){
            message.replyLang("GENERIC_GUILD_UNAVAILABLE");
        }else if(!message.member.voiceChannel) {
            message.replyLang("VOICE_NO_CHANNEL");
        }else if(message.member.voiceChannel.full){
            message.replyLang("VOICE_FULL_CHANNEL");
        }else if(!message.member.voiceChannel.joinable) {
            message.replyLang("VOICE_UNJOINABLE_CHANNEL");
        }else if(!message.member.voiceChannel.speakable){
            message.replyLang("VOICE_UNSPEAKABLE_CHANNEL");
        }else if(runningGames[message.guild.id] && runningGames[message.guild.id].channel.id !== message.member.voiceChannel.id) {
            message.channel.send(`There is already a game running in ${runningGames[message.guild.id].channel.name}!`);
        }else if(message.guild.voiceConnection && !bot.voiceLeaveTimeouts[message.member.voiceChannel.id] && message.getSetting("songguess.disallowReguess")) {
            message.channel.send("I'm already in a voice channel doing something.");
        }else if(await bot.database.hasActiveSession(message.guild.id)){
            message.channel.send("The bot is currently playing music. Please wait for the queue to end to start guessing");
        }else{
            try {
                bot.logger.log("Joining voice channel "+message.member.voiceChannel.name);
                doGuess(message.member.voiceChannel, message, bot);
            }catch(e){
                bot.raven.captureException(e);
                bot.logger.log(e);
                message.replyLang("GENERIC_ERROR");
            }
        }
    }
};

let timeouts = [];

let runningGames = [];

async function doGuess(voiceChannel, message, bot){
    try {
        if (voiceChannel.members.size === 1 && voiceChannel.members.first().id === bot.client.user.id)
            return bot.lavaqueue.requestLeave(voiceChannel, "Channel was empty");
        if(timeouts[voiceChannel.id])
            return;
        if(runningGames[voiceChannel.id])
            return;
        const song = songList[count++ % songList.length];
        const file = song.path;
        const now = new Date();
        const artistName = song.name;
        const title = artistName + " - " + song.title;
        const answer = song.title.toLowerCase().replace(/\W/g, "").replace(/[\(\[].*[\)\]]/, "");
        const artist = artistName.toLowerCase().replace(/\W/g, "").replace(/[\(\[].*[\)\]]/, "");
        bot.logger.log("Title is " + answer);
        message.replyLang("SONGGUESS", {minutes: message.getSetting("songguess.seconds") / 60});
        console.log("Joining");
        let {player} = await bot.lavaqueue.playOneSong(voiceChannel, file);
        let won = false;
        let collector = message.channel.createMessageCollector(() => true, {time: message.getSetting("songguess.seconds") * 1000});
        runningGames[voiceChannel.id] = {player, collector};
        player.seek(10);
        player.once("end", function(){
            if (!won && collector) {
                collector.stop();
            }
        });

        collector.on('collect', async function collect(message) {
            if (message.author.id === "146293573422284800") return;
            if (message.author.bot)return;
            if(bot.banCache.user.indexOf(message.author.id) > -1)return;
            const guessTime = new Date();
            const strippedMessage = message.cleanContent.toLowerCase().replace(/\W/g, "").replace(message.getSetting("prefix")+"guess");
            console.log(strippedMessage);
            if (message.getSetting("songguess.showArtistName") === "true" && strippedMessage.indexOf(answer) > -1 || (strippedMessage.length >= (answer.length / 3) && answer.indexOf(strippedMessage) > -1)) {

                won = true;
                if (collector)
                    collector.stop();

                let embed = new Discord.RichEmbed();
                embed.setColor("#77ee77");
                embed.setTitle(`${message.author.username} wins!`);
                embed.setThumbnail(`https://unacceptableuse.com/petify/album/${song.album}`);
                embed.setDescription(`The song was **${title}**`);
                embed.addField(":stopwatch: Time Taken", bot.util.prettySeconds((guessTime - now) / 1000));
                let fastestTime = (await bot.database.getFastestSongGuess(title))[0];
                if(fastestTime && fastestTime.elapsed) {
                    let fastestUser = await bot.util.getUserInfo(fastestTime.user);
                    embed.addField(":timer: Fastest Time", bot.util.prettySeconds(fastestTime.elapsed / 1000)+(fastestUser ? ` (${fastestUser.username}#${fastestUser.discriminator})` : ""));
                }

                message.channel.send(message.author, embed);

                let newOffset = guessTime-now;
                if(fastestTime && fastestTime.elapsed && fastestTime.elapsed > newOffset)
                    message.channel.send(`:tada: You beat the previous fastest time for that song!`);

                let totalGuesses = await bot.database.getTotalCorrectGuesses(message.author.id);

                if(totalGuesses && totalGuesses[0] && totalGuesses[0]['COUNT(*)'])
                    bot.badges.updateBadge(message.author, "guess", totalGuesses[0]['COUNT(*)'] + 1, message.channel);

                if(!voiceChannel.members.has(message.author.id))
                    bot.badges.giveBadgeOnce(message.author, message.channel, 5); //Psychic Badge

            } else if (strippedMessage.indexOf(artist) > -1 || (strippedMessage.length >= (artist.length / 3) && artist.indexOf(strippedMessage) > -1)) {
                message.replyLang("SONGGUESS_ARTIST", {id: message.author.id, artist: artistName});
            }else if(strippedMessage.indexOf(title) > -1){
                message.reply("the song title is somewhere in your message!");
            }
            bot.database.addSongGuess(message.author.id, message.channel.id, message.guild.id, message.cleanContent, title, won, guessTime - now);
        });
        collector.on('end', async function collectorEnd() {
            console.log("Collection Ended");
            if(!won)
                message.replyLang("SONGGUESS_OVER", {title});
            await player.stop();
            bot.lavaqueue.requestLeave(voiceChannel, "Song is over");
            if(message.getSetting("guess.repeat")) {
                timeouts[voiceChannel.id] = setTimeout(function () {
                    delete timeouts[voiceChannel.id];
                    delete runningGames[voiceChannel.id];
                    doGuess(voiceChannel, message, bot);
                }, 2000);
            }else{
                delete runningGames[voiceChannel.id];
            }
        });
    }catch(e){
        if(message)
            message.replyLang("GENERIC_ERROR");
        console.log(e);

    }
}