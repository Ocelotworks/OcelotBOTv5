/**
 *   ╔════   Copyright 2018 Peter Maguire
 *  ║ ════╗  Created 05/12/2018
 * ╚════ ║   (ocelotbotv5) songguess
 *  ════╝
 */

let songList = [];
let count = 0;
const request = require('request');
const Discord = require('discord.js');

const relations = {
    forwards: {
        MASHUP: "is a mashup of",
        SAMPLES: "samples",
        COPIES: "copies",
        REMIX: "is a remix of",
        ALTERNATE: "is an alternate version of",
        REFERENCES: "references",
        COVER: "is a cover of",
        DUPLICATE: "is a duplicate of",
        PARODY: "is a parody of",
        DEMO: "is a demo version of"
    },
    backwards: {
        MASHUP: "was mashed up by",
        SAMPLES: "was sampled by",
        COPIES: "copied by",
        REMIX: "was remixed in",
        ALTERNATE: "is an alternate version of",
        REFERENCES: "was referenced by",
        COVER: "was covered in",
        DUPLICATE: "is a duplicate of",
        PARODY: "was parodied in",
        DEMO: "is the complete version of",
    }
};

module.exports = {
    name: "Guess The Song",
    usage: "guess [stop/stats/leaderboard]",
    rateLimit: 25,
    categories: ["games", "voice"],
    //requiredPermissions: ["CONNECT", "SPEAK"],
    commands: ["guess", "guesssong", "songguess", "namethattune", "quess", "gues"],
    init: async function init(bot){

        bot.util.standardNestedCommandInit("guess");
        bot.voiceLeaveTimeouts = {};

        bot.logger.log("Loading song list...");

        songList = await bot.database.getSongList();

        bot.logger.log(`Loaded ${songList.length} songs`);
    },
    shutdown: async function(bot){
        bot.logger.log("Shutting down running guess games");
        let keys = Object.keys(runningGames);
        for(let i = 0; i < keys.length; i++){
            bot.logger.log("Shutting down running guess game "+keys[i]);
            let {player} = runningGames[keys[i]];
            await player.seek(100000);
            // await player.leave();
            await player.destroy();
        }
    },
    run:  async function run(message, args, bot) {
        if (args[1]) {
            await bot.util.standardNestedCommand(message, args, bot, 'guess', runningGames, () => {
                if (message.member && message.member.voice.channel && runningGames[message.member.voice.channel.id]) {
                    message.channel.send(`To guess the name of the song, just type the answer with no command. To stop, type ${args[0]} stop. To see other commands, type ${args[0]} help`)
                } else {
                    message.channel.send(`To start a game, just type ${args[0]}. To see stats, type ${args[0]} help`)
                }
            });
        }else if (songList.length === 0 || !bot.lavaqueue || !bot.lavaqueue.manager.nodes.has(message.getSetting("songguess.node")) || !bot.lavaqueue.manager.nodes.get(message.getSetting("songguess.node")).connected) {
            message.replyLang("SONGGUESS_UNAVAILABLE");
        } else if (!message.guild) {
            message.replyLang("GENERIC_DM_CHANNEL");
        } else if (!message.guild.available) {
            message.replyLang("GENERIC_GUILD_UNAVAILABLE");
        } else if (!message.member.voice || !message.member.voice.channel) {
            message.replyLang("VOICE_NO_CHANNEL");
        } else if (message.member.voice.channel.full) {
            message.replyLang("VOICE_FULL_CHANNEL");
        } else if (!message.member.voice.channel.joinable) {
            message.replyLang("VOICE_UNJOINABLE_CHANNEL");
        } else if (!message.member.voice.channel.speakable) {
            message.replyLang("VOICE_UNSPEAKABLE_CHANNEL");
        } else if (runningGames[message.guild.id] && runningGames[message.guild.id].channel.id !== message.member.voice.channel.id) {
            message.replyLang("SONGGUESS_ALREADY_RUNNING", {channel: runningGames[message.guild.id].channel.name})
        } else if (message.guild.voiceConnection && !bot.voiceLeaveTimeouts[message.member.voice.channel.id] && message.getSetting("songguess.disallowReguess")) {
            message.replyLang("SONGGUESS_OCCUPIED");
        } else if (await bot.database.hasActiveSession(message.guild.id)) {
            message.replyLang("SONGGUESS_MUSIC");
            message.channel.send("The bot is currently playing music. Please wait for the queue to end to start guessing");
        } else {
            try {
                bot.logger.log("Joining voice channel " + message.member.voice.channel.name);
                await doGuess(message.member.voice.channel, message, bot);
            } catch (e) {
                bot.raven.captureException(e);
                bot.logger.log(e);
                message.replyLang("GENERIC_ERROR");
            }
        }
    }
};

let timeouts = [];

let runningGames = [];

async function doGuess(voiceChannel, message, bot, hasFailed = false){
    try {
        if (voiceChannel.members.size === 1 && voiceChannel.members.first().id === bot.client.user.id)
            return bot.lavaqueue.requestLeave(voiceChannel, "Channel was empty");
        if(timeouts[voiceChannel.id])
            return;
        if(runningGames[voiceChannel.id])
            return;
        let song = songList[count++ % songList.length];
        if(message.getSetting("songguess.force")){
            const forcedSong = message.getSetting("songguess.force");
            song = songList.find((song)=>song.id === forcedSong);
        }
        const file = song.path;
        const now = new Date();
        const artistName = song.name;
        const title = artistName + " - " + song.title;
        const answer = song.title.toLowerCase().replace(/\W/g, "").replace(/[\(\[].*[\)\]]/, "");
        const artist = artistName.toLowerCase().replace(/\W/g, "").replace(/[\(\[].*[\)\]]/, "");
        bot.logger.log("Title is " + answer);
        let hints = [];
        request({url: `https://unacceptableuse.com/petifyv3/api/v2/song/${song.id}/related`, json: true}, (err, resp, body)=>{
            if(err)return;
            if(!body)return;
            if(body.err)return;
            for(let i = 0; i < body.length; i++){
                let relation = body[i];
                if(!relation.relatedSong)continue;
                const hintTitle = relation.relatedSong.artist.name + " - "+relation.relatedSong.title;
                if(hintTitle.toLowerCase() === title.toLowerCase())continue;
                hints.push({
                    hint: relation.relatedSong.title.toLowerCase().replace(/\W/g, "").replace(/[\(\[].*[\)\]]/, ""),
                    hintText: `This song ${relations[relation.direction][relation.relation]} **${hintTitle}**`
                });
            }
            bot.logger.log(`This song has ${hints.length} hints.`);
        })

        if(!hasFailed)
            message.replyLang("SONGGUESS", {minutes: message.getSetting("songguess.seconds") / 60});
        console.log("Joining");
        let span = bot.util.startSpan("Create player");
        let player;
        let errored = false;
        try {
            player = (await bot.lavaqueue.playOneSong(voiceChannel, file, message.getSetting("songguess.node"))).player;
        }catch(e){
           errored = true;
        }

        if(!player || errored) {
            if (hasFailed && message) {
                return message.replyLang("GENERIC_ERROR");
            }
            span.end();
            return doGuess(voiceChannel, message, bot, true)
        }
        span.end();
        let won = false;
        span = bot.util.startSpan("Create message collector");
        let collector = message.channel.createMessageCollector(() => true, {time: message.getSetting("songguess.seconds") * 1000});
        runningGames[voiceChannel.id] = {player, collector};
        player.seek(10);
        span.end();
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
            if (strippedMessage.indexOf(answer) > -1 || (strippedMessage.length >= (answer.length / 3) && answer.indexOf(strippedMessage) > -1)) {

                won = true;
                if (collector)
                    collector.stop();
                message.channel.startTyping();

                let points = 10;
                await bot.database.addPoints(message.author.id, 10, `guess win`);

                let embed = new Discord.MessageEmbed();
                embed.setColor("#77ee77");
                embed.setTitle(`${message.author.username} wins!`);
                embed.setThumbnail(`https://unacceptableuse.com/petify/album/${song.album}`);
                embed.setDescription(`The song was **${title}**`);
                embed.addField(":stopwatch: Time Taken", bot.util.prettySeconds((guessTime - now) / 1000, message.guild && message.guild.id, message.author.id));
                span = bot.util.startSpan("Get fastest guess");
                let fastestTime = (await bot.database.getFastestSongGuess(title))[0];
                span.end();
                if(fastestTime && fastestTime.time) {
                    let fastestUser = await bot.util.getUserInfo(fastestTime.user);
                    embed.addField(":timer: Fastest Time", bot.util.prettySeconds(fastestTime.time / 1000, message.guild && message.guild.id, message.author.id)+(fastestUser ? ` (${fastestUser.username}#${fastestUser.discriminator})` : ""));
                }


                bot.util.replyTo(message, embed)
                span = bot.util.startSpan("Update record");
                let newOffset = guessTime-now;
                if(fastestTime && fastestTime.time && fastestTime.time > newOffset) {
                    await bot.database.updateSongRecord(title, message.author.id, newOffset);
                    message.replyLang("SONGGUESS_RECORD");
                    await bot.database.addPoints(message.author.id, 15, `guess record`);
                    points += 15;
                }
                span.end();

                if(message.getBool("points.enabled")){
                    embed.addField("Points", `+<:points:817100139603820614>${points}`)
                }

                span = bot.util.startSpan("Update badges");
                let totalGuesses = await bot.database.getTotalCorrectGuesses(message.author.id);

                if(totalGuesses && totalGuesses[0] && totalGuesses[0]['COUNT(*)'])
                    bot.badges.updateBadge(message.author, "guess", totalGuesses[0]['COUNT(*)'] + 1, message.channel);

                if(!voiceChannel.members.has(message.author.id))
                    bot.badges.giveBadgeOnce(message.author, message.channel, 5); //Psychic Badge

                span.end();
                message.channel.stopTyping(true);
            } else if (message.getSetting("songguess.showArtistName") === "true" && strippedMessage.indexOf(artist) > -1 || (strippedMessage.length >= (artist.length / 3) && artist.indexOf(strippedMessage) > -1)) {
                message.replyLang("SONGGUESS_ARTIST", {id: message.author.id, artist: artistName});
            }else if(strippedMessage.indexOf(title) > -1){
                message.reply("the song title is somewhere in your message!");
            }else{
                span = bot.util.startSpan("Process hints");
                for(let i = 0; i< hints.length; i++){
                    if(strippedMessage.indexOf(hints[i].hint) > -1 || (strippedMessage.length >= (hints[i].hint.length / 3) && answer.indexOf(strippedMessage) > -1)){
                        message.reply(`Hint: ${hints[i].hintText}`);
                        break;
                    }
                }
                span.end();
            }
            span = bot.util.startSpan("Log guess");
            await bot.database.addSongGuess(message.author.id, message.channel.id, message.guild.id, message.cleanContent, title, won, guessTime - now);
            span.end();
            span.end();
        });
        collector.on('end', async function collectorEnd() {
            console.log("Collection Ended");
            if(!won)
                message.replyLang("SONGGUESS_OVER", {title});
            await player.stop();
            player.removeAllListeners();
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