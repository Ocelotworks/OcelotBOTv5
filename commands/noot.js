const fs = require('fs');
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
    "https://www.youtube.com/watch?v=_yAvEdPPyqc",
    "https://www.youtube.com/watch?v=QLyXH4YaiCc",
    "https://www.youtube.com/watch?v=pFPBve2EJ5k",
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
    usage: "noot",
    rateLimit: 50,
    categories: ["memes", "voice"],
    //requiredPermissions: ["CONNECT", "SPEAK"],
    commands: ["noot", "pingu"],
    unwholesome: true,
    run: async function run(message, args, bot) {
        if (args[1] && args[1].toLowerCase() === "stop") {
            message.channel.send(`Use ${message.getSetting("prefix")}music stop to stop nooting`);
        }else if (!message.guild) {
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
            message.channel.send(`The bot is currently playing music. Please wait for the queue or type ${message.getSetting("prefix")}music stop to end to start nooting`);
        } else {
            try {
                bot.logger.log("Joining voice channel " + message.member.voice.channel.name);
                let nootNumber = nootCount++ % noots.length;
                if(args[1] && !isNaN(parseInt(args[1])))nootNumber = parseInt(args[1]);
                const noot = noots[nootNumber]
                message.channel.startTyping();
                let {songData, player} = await bot.lavaqueue.playOneSong(message.member.voice.channel, noot);
                player.once("start", ()=>{
                    message.channel.stopTyping();
                    message.channel.send(`<:noot:524657747757891615> Noot #${nootNumber} (${songData.info.title})\nUse \`${args[0]} ${nootNumber}\` to play this again.`);
                });
            } catch (e) {
                bot.raven.captureException(e);
                bot.logger.log(e);
                message.replyLang("GENERIC_ERROR");
            }
        }
    }
};