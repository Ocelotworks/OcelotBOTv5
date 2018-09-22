module.exports = {
    name: "Clear Language Cache",
    usage: "clearlangcache",
    commands: ["clearlangcache"],
    run: async function(message, args, bot){
        bot.languageCache = {};
        message.channel.send("Language cache cleared.");
    }
};