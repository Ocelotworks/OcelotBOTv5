module.exports = {
    name: "Download Languages",
    usage: "downloadlang",
    commands: ["downloadlang"],
    run:  function(message, args, bot){
        message.channel.send("Downloading Languages");
        bot.lang.loadLanguages();
    }
};