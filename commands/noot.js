const noots = [
    "https://www.youtube.com/watch?v=x9ur3exaUTI",
    "https://www.youtube.com/watch?v=lrAW0YWh1CU",
    "https://www.youtube.com/watch?v=qOJ27Pt_s34",
    "https://www.youtube.com/watch?v=cYlB3dN-udY",
    "https://www.youtube.com/watch?v=g6_hj3NXjxM",
    "https://www.youtube.com/watch?v=_eX8gZfk8pw",
    "https://www.youtube.com/watch?v=_a-ItrnOgiI",
    "https://www.youtube.com/watch?v=mHeBkUGOQA8",
    "https://www.youtube.com/watch?v=QHZ8HSlAp_o",
    //"https://www.youtube.com/watch?v=_yAvEdPPyqc",
    "https://www.youtube.com/watch?v=QLyXH4YaiCc",
    // "https://www.youtube.com/watch?v=pFPBve2EJ5k",
    "https://www.youtube.com/watch?v=Ypk-4STrw3k",
    "https://www.youtube.com/watch?v=pifEmJ7ILYE",
    "https://youtu.be/bA7BpOHtL30",
    "https://www.youtube.com/watch?v=KV7CBBmw3Tw",
    "https://www.youtube.com/watch?v=8BoFRA5apms",
    "https://www.youtube.com/watch?v=8KiPNxEArAg",
    "https://www.youtube.com/watch?v=-_j5uFFlws4",
    "https://www.youtube.com/watch?v=WXHSuLht7aQ",
    "https://www.youtube.com/watch?v=H0IlJc_vkZ0",
    "https://www.youtube.com/watch?v=MlrpyWIm984",
    "https://www.youtube.com/watch?v=B5UkWZxD6Zg",
    "https://www.youtube.com/watch?v=pHN47Bg-LX8",
    "https://youtu.be/qZYT6No9Jqso",
    "https://www.youtube.com/watch?v=oj3IxeuIrkI",
    "https://www.youtube.com/watch?v=LGPto3GL_NE"
]
let nootCount = 0;
module.exports = {
    name: "Noot Noot",
    usage: "noot :0id?",
    rateLimit: 50,
    categories: ["memes", "voice"],
    //requiredPermissions: ["CONNECT", "SPEAK"],
    commands: ["noot", "pingu"],
    unwholesome: true,
    slashHidden: true,
    hidden: true,
    run: async function run(context, bot) {
        if (bot.util.checkVoiceChannel(context)) return;
        try {
            bot.logger.log("Joining voice channel " + context.member.voice.channel.name);
            let nootNumber = (context.options.id || nootCount++) % noots.length;
            const noot = noots[nootNumber]
            context.defer();
            let {songData, player} = await bot.lavaqueue.playOneSong(context.member.voice.channel, noot);
            if(!player)
                return context.channel.send("No lavalink node is currently available. Try again later.");
            player.once("start", ()=>{
                context.send(`<:noot:524657747757891615> Noot #${nootNumber} (${songData.info.title})\nUse \`${context.getSetting("prefix")}${context.command} ${nootNumber}\` to play this again.`);
            });
        } catch (e) {
            bot.raven.captureException(e);
            bot.logger.log(e);
            context.sendLang({content: "GENERIC_ERROR", ephemeral: true});
        }
    }
};