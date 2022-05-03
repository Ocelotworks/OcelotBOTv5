let nootCount = 0;
const noots = [
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
    usage: "doot :0num?",
    rateLimit: 50,
    categories: ["voice", "memes"],
    detailedHelp: "Doot Doot\nPlays a random doot remix in the voice channel you're in",
    //requiredPermissions: ["CONNECT", "SPEAK"],
    commands: ["doot", "toot"],
    slashHidden: true,
    run: async function run(context, bot) {
        if (bot.util.checkVoiceChannel(context.message)) return;
        try {
            bot.logger.log("Joining voice channel " + context.member.voice.channel.name);
            let nootNumber = (context.options.id || nootCount++) % noots.length;
            const noot = noots[nootNumber]
            context.defer();
            let {songData, player} = await bot.lavaqueue.playOneSong(context.member.voice.channel, noot);
            if(!player)
                return context.send("No lavalink node is currently available. Try again later.");
            player.once("start", ()=>{
                context.sendLang("DOOT", {doot: nootNumber, arg: context.command, fileName: songData.info.title});
            });
        } catch (e) {
            bot.raven.captureException(e);
            bot.logger.log(e);
            context.sendLang({content: "GENERIC_ERROR", ephemeral: true});
        }
    }
};