module.exports = {
    name: "Strong Opinions Meme",
    usage: "opinions <text>",
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["opinions", "strongopinions"],
    run:  function(message, args, bot){
        bot.util.processImageMeme(message, args, 862, 159, 60, 5, "opinions.png", "static/opinions.png");
    }
};