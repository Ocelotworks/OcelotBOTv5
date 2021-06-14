let dootCount = 0;
const doots = [
    "https://www.youtube.com/watch?v=4UlR1sWybQo",
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
        }
        if (bot.util.checkVoiceChannel(message)) return;

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
};