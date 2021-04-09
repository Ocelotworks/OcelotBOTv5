/**
 *   ╔════   Copyright 2018 Peter Maguire
 *  ║ ════╗  Created 05/12/2018
 * ╚════ ║   (ocelotbotv5) songguess
 *  ════╝
 */

const Discord = require('discord.js');
const axios = require('axios');
const config = require('config');
let counter = Math.round(Math.random()*100); // Start a random position in the playlist on startup
let runningGames = {"":{
    voiceChannel: {},
    textChannel: {},
    currentTrack: {},
    currentTrackStarted: new Date(),
    playlistId: '',
    lastGuessTime: 0,
    custom: false,
    collector: {},
    ending: false,
}};

const spotifyPlaylist = /.*open\.spotify\.com\/playlist\/(.*)[\/?#]?/gi

module.exports = {
    name: "Guess The Song",
    usage: "guess [stop/stats/leaderboard]",
    rateLimit: 25,
    categories: ["games", "voice"],
    //requiredPermissions: ["CONNECT", "SPEAK"],
    commands: ["guess", "guesssong", "songguess", "namethattune", "quess", "gues"],
    init: async function init(bot){
        bot.util.standardNestedCommandInit("guess");
    },
    run:  async function run(message, args, bot) {
        if (!message.guild) {
            return message.replyLang("GENERIC_DM_CHANNEL");
        }
        let playlist = null;
        let isCustom = false;
        if (args[1] && (playlist = await bot.database.getGuessPlaylist(message.guild.id, args[1].toLowerCase())) == null) {
            let regexResult = spotifyPlaylist.exec(args[1]);
            if(regexResult && regexResult[1]){
                isCustom = true;
                playlist = regexResult[1]
            }else{
                return bot.util.standardNestedCommand(message, args, bot, 'guess', runningGames, () => {
                    if (message.member && message.member.voice.channel && runningGames[message.guild.id]) {
                        message.channel.send(`To guess the name of the song, just type the answer with no command. To stop, type ${args[0]} stop. To see other commands, type ${args[0]} help`)
                    } else {
                        message.channel.send(`To start a game, just type ${args[0]}. To see other commands, type ${args[0]} help`)
                    }
                });
            }
        }

        if(playlist === null){
            playlist = await bot.database.getGuessPlaylist(message.guild.id, message.getSetting("songguess.default"));
        }

        if (!bot.lavaqueue || !bot.lavaqueue.manager.nodes.has(message.getSetting("songguess.node")) || !bot.lavaqueue.manager.nodes.get(message.getSetting("songguess.node")).connected) {
            return message.replyLang("SONGGUESS_UNAVAILABLE");
        }

        if (!message.guild.available) {
            return message.replyLang("GENERIC_GUILD_UNAVAILABLE");
        }
        if (!message.member.voice || !message.member.voice.channel) {
            return message.replyLang("VOICE_NO_CHANNEL");
        }
        if (message.member.voice.channel.full) {
            return message.replyLang("VOICE_FULL_CHANNEL");
        }
        if (!message.member.voice.channel.joinable) {
            return message.replyLang("VOICE_UNJOINABLE_CHANNEL");
        }
        if (!message.member.voice.channel.speakable) {
            return message.replyLang("VOICE_UNSPEAKABLE_CHANNEL");
        }
        if (runningGames[message.guild.id]) {
            if(playlist != runningGames[message.guild.id].playlistId){
                runningGames[message.guild.id].playlistId = playlist;
                let playlistName = args[1];
                if(!args[1])
                    playlistName = message.getSetting("songguess.default");
                else if(args[1].startsWith("http"))
                    playlistName = "<"+args[1]+">";
                return message.channel.send(`Switched the playlist to **${playlistName}**`);
            }
            return message.replyLang("SONGGUESS_ALREADY_RUNNING", {channel: runningGames[message.guild.id].voiceChannel.name})
        }
        if (message.guild.voiceConnection && !bot.voiceLeaveTimeouts[message.member.voice.channel.id] && message.getSetting("songguess.disallowReguess")) {
            return message.replyLang("SONGGUESS_OCCUPIED");
        }

        if (await bot.database.hasActiveSession(message.guild.id)) {
            return message.replyLang("SONGGUESS_MUSIC");
        }

        return startGame(bot, message, playlist, isCustom);
    }

};

async function endGame(bot, id){
    bot.logger.log("Ending game ", id)
    const game = runningGames[id];
    if(!game || game.ending)return;
    game.ending = true;
    // Player listeners are removed first to stop the next song from playing
    game.player.removeAllListeners();
    // The collector is stopped to trigger the end of round message
    game.collector.stop();
    // The collectors listeners are removed then the song is stopped
    game.collector.removeAllListeners();
    await game.player.stop();
    await bot.lavaqueue.manager.leave(game.voiceChannel.guild.id);
    delete runningGames[id];
}

async function startGame(bot, message, playlistId, custom){
    message.channel.startTyping();
    const vcId = message.member.voice.channel.id;
    const player = await bot.lavaqueue.manager.join({
        guild: message.guild.id,
        channel: vcId,
        node: bot.lavaqueue.manager.idealNodes[0].id,
    }, {selfdeaf: true})

    runningGames[message.guild.id] = {
        voiceChannel: message.member.voice.channel,
        textChannel: message.channel,
        playlistId,
        player,
        custom,
        end: ()=>endGame(bot, message.guild.id),
    }
    player.on("error", (e)=>{
        console.error(e);
        message.channel.send("Something went wrong. "+e.type);
        endGame(bot, message.guild.id);
    });
    await newGuess(bot, message.member.voice.channel);
}

async function newGuess(bot, voiceChannel, retrying = false){
    const game = runningGames[voiceChannel.guild.id];
    const playlist = await getPlaylist(bot, game.playlistId);
    if(!playlist || playlist.length === 0) {
        endGame(bot,  voiceChannel.guild.id);
        return game.textChannel.send(":warning: The playlist you selected has no playable songs.")
    }
    const song = playlist[counter++ % playlist.length];
    console.log(song);
    game.currentTrack = song;
    const songData = await bot.lavaqueue.getSong(song.track.preview_url, game.player);
    if(!songData){
        if(!retrying) {
            console.log("retrying...");
            return newGuess(bot, voiceChannel, true);
        }else{
            game.textChannel.stopTyping();
            endGame(bot, voiceChannel.guild.id);
            return game.textChannel.channel.send("Failed to load song. Try again later.")
        }
    }
    game.player.once("start", ()=>{
        game.textChannel.stopTyping();
        game.textChannel.send("Guess the name of this song, you have 30 seconds.");
        doGuess(bot, game.player, game.textChannel, song, game.voiceChannel);
    });
    return game.player.play(songData.track);
}

async function doGuess(bot, player, textChannel, song, voiceChannel){
    const game = runningGames[voiceChannel.guild.id];
    const guessStarted = new Date();
    const loggedTrackName = `${song.track.artists[0].name} - ${song.track.name}`;
    const normalisedName = normalise(song.track.name)
    const artistNames = song.track.artists.map((a)=>normalise(a.name));
    let artistsVisited = [];
    bot.logger.log(`Track is ${artistNames} - ${normalisedName}`);
    const collector = textChannel.createMessageCollector((m)=>{
        if(m.author.bot)return false;
        game.lastGuessTime = new Date();
        let elapsed = new Date()-guessStarted;
        const normalisedContent = normalise(m.cleanContent);
        console.log(normalisedContent);
        const partialLength = normalisedName.indexOf(normalisedContent) > -1 ? normalisedContent.length : 0;
        // If the message contains the entire title, or the message is more than 30% of the title
        if(normalisedContent.indexOf(normalisedName) > -1 || partialLength >= normalisedName.length/3){
            bot.database.addSongGuess(m.author.id, m.channel.id, m.guild.id, normalisedContent, loggedTrackName, 1, elapsed, game.custom);
            return true;
        }

        // If the message has 40% of the title give them a little reaction
        if(partialLength >= normalisedName.length/4)
            m.react("👀")

        // If they mention one of the artists, send them a message the first time
        for(let i = 0; i < artistNames.length; i++){
            if(normalisedContent.indexOf(artistNames[i]) > -1 && !artistsVisited[i]){
                bot.util.replyTo(m, `${song.track.artists[i].name} is ${artistNames.length > 1 ? "one of the artists" : "the artist"}, but we're not looking for that.`);
                artistsVisited[i] = true;
                break
            }
        }
        bot.database.addSongGuess(m.author.id, m.channel.id, m.guild.id, "", loggedTrackName, 0, elapsed, game.custom);
        return false;
    }, {max: 1, time: 30000})

    game.collector = collector;

    player.once("end", ()=>{
        if(!collector.ended) {
            collector.stop();
        }
    })

    collector.on("end", async (collected)=>{
        player.stop();
        const winner = collected.first();
        if(winner) {
            const winEmbed = new Discord.MessageEmbed();
            if(song.primary_color)
                winEmbed.setColor(song.primary_color);
            else
                winEmbed.setColor("#00ff00");
            winEmbed.setTitle(`${winner.author.username} wins!`);
            if(song.track.external_urls && song.track.external_urls.spotify)
                winEmbed.setDescription(`The song was **[${loggedTrackName}](${song.track.external_urls.spotify})**`);
            else
                winEmbed.setDescription(`The song was **${loggedTrackName}**`);
            if(song.track.images && song.track.images[0])
                winEmbed.setThumbnail(song.track.images[0].url);
            else if(song.track.album && song.track.album.images && song.track.album.images[0])
                winEmbed.setThumbnail(song.track.album.images[0].url);
            let elapsed = winner.createdAt-guessStarted;
            winEmbed.addField(":stopwatch: Time Taken", bot.util.prettySeconds(elapsed / 1000, winner.guild.id, winner.author.id));
            if(!game.custom) {
                const fastestGuess = await bot.database.getFastestSongGuess(loggedTrackName);
                if (fastestGuess[0]) {
                    let field = bot.util.prettySeconds(fastestGuess[0].time / 1000, winner.guild.id, winner.author.id);
                    const user = await bot.util.getUserInfo(fastestGuess[0].user);
                    if (user) {
                        field += ` (${user.tag})`
                    }
                    winEmbed.addField(":timer: Fastest Time", field);
                }

                if (!fastestGuess[0] || fastestGuess[0].time > elapsed) {
                    bot.database.updateSongRecord(loggedTrackName, winner.author.id, elapsed)
                    if (fastestGuess[0]) {
                        textChannel.send(":tada: You beat the fastest time for this song!");
                    }
                }
            }

            bot.util.replyTo(winner, winEmbed);
        }else {
            textChannel.send(`:stopwatch: The song is over! The answer was **${song.track.artists.map((a) => a.name).join(", ")} - ${song.track.name}**`);
        }
        if(game.ending)return;
        if(voiceChannel.members.filter((m)=>!m.user.bot).size < 1)return textChannel.send(":zzz: Stopping because nobody is in the voice channel anymore.");
        if((new Date()).getTime()-game.lastGuessTime > 60000)return textChannel.send(":zzz: Stopping because nobody has guessed anything in a while.");
        if(new Date().getTime()-guessStarted < 1000 && !winner)return bot.logger.log("Track took less than a second to play, something bad happened");
        return newGuess(bot, voiceChannel);
    })
}

function normalise(text){
    return text.toLowerCase().replace(/[ \-_'@"&“”‘’‚,:]|[(\[].*[)\]]|remastered/g,"");
}

async function getToken(bot){
    const key = Buffer.from(`${config.get("API.spotify.client_id")}:${config.get("API.spotify.client_secret")}`).toString("base64");

    let tokenData = await bot.redis.cache("songguess/token", async () => (await axios.post("https://accounts.spotify.com/api/token", "grant_type=client_credentials", {
        headers: {
            Authorization: `Basic ${key}`,
            "Content-Type": "application/x-www-form-urlencoded"
        }
    })).data, 3600);

    return tokenData.access_token;
}

async function getPlaylist(bot, playlistId){
    return await bot.redis.cache(`songguess/playlist/${playlistId}`, async () =>{
        let result = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?market=GB`, {
            headers: {
                authorization: `Bearer ${await getToken(bot)}`
            }
        })

        if(!result.data.items){
            return console.log("Invalid response", result.data);
        }
        let songList = result.data.items.filter((item)=>item.track&&item.track.preview_url);
        bot.util.shuffle(songList);
        return songList;
    }, 3.6e+6);
}