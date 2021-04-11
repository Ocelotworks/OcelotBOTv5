let dootCount = 0;
const doots = [
    "https://www.youtube.com/watch?v=dHRqHfT9Nfo",
    "https://www.youtube.com/watch?v=_C0fxoot-7c",
    "https://www.youtube.com/watch?v=4UlR1sWybQo",
    "https://www.youtube.com/watch?v=T2O7gAjeLOA",
    "https://www.youtube.com/watch?v=NyKVXmKEsIc",
    "https://www.youtube.com/watch?v=0hcFghzGR9Q",
    "https://www.youtube.com/watch?v=i_lnsQYVBQo",
    "https://www.youtube.com/watch?v=kmqOV4JkRcs",
    "https://www.youtube.com/watch?v=00pPqN6sYFo",
    "https://www.youtube.com/watch?v=j-9zTTEA7gE",
    "https://www.youtube.com/watch?v=atgpVxF9QKY",
    "https://www.youtube.com/watch?v=W3ZCDMkb3rw",
    "https://www.youtube.com/watch?v=qK1D87bag8o2"
]
module.exports = {
    name: "Doot Doot",
    usage: "doot",
    rateLimit: 50,
    categories: ["voice", "memes"],
    detailedHelp: "Doot Doot\nPlays a random doot remix in the voice channel you're in",
    //requiredPermissions: ["CONNECT", "SPEAK"],
    commands: ["doot", "toot"],
    run: async function run(message, args, bot) {
        if (args[1] && args[1].toLowerCase() === "stop") {
            message.channel.send(`(Use ${message.getSetting("prefix")}music stop to stop dooting)\nhttps://i.imgur.com/QA8anth.jpg`);
        } else if (!message.guild) {
            message.replyLang("GENERIC_DM_CHANNEL");
        } else if (!message.guild.available) {
            message.replyLang("GENERIC_GUILD_UNAVAILABLE");
        } else if (!message.member.voice.channel) {
            message.replyLang("VOICE_NO_CHANNEL");
        } else if (message.member.voice.channel.full) {
            message.replyLang("VOICE_FULL_CHANNEL");
        } else if (!message.member.voice.channel.joinable) {
            message.replyLang("VOICE_UNJOINABLE_CHANNEL");
        } else if (!message.member.voice.channel.speakable) {
            message.replyLang("VOICE_UNSPEAKABLE_CHANNEL");
        } else if (await bot.database.hasActiveSession(message.guild.id)) {
            message.channel.send(`The bot is currently playing music. Please wait for the queue or type ${message.getSetting("prefix")}music stop to end to start dooting`);
        } else {
            try {
                bot.logger.log("Joining voice channel " + message.member.voice.channel.name);
                let dootNumber = dootCount++ % doots.length;
                if(args[1] && !isNaN(parseInt(args[1])))dootNumber = parseInt(args[1]) % doots.length;
                const doot = doots[dootNumber]
                message.channel.startTyping();
                let {songData, player} = await bot.lavaqueue.playOneSong(message.member.voice.channel, doot);
                player.once("start", ()=>{
                    message.channel.stopTyping();
                    message.replyLang("DOOT", {doot: dootNumber, arg: args[0], fileName: songData.info.title});
                });
            } catch (e) {
                bot.raven.captureException(e);
                bot.logger.log(e);
                message.replyLang("GENERIC_ERROR");
            }
        }
    }
};