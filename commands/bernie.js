module.exports = {
    name: "Bernie Meme",
    usage: "bernie <text>",
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["bernie", "sanders"],
    run: function(message, args, bot){
        bot.util.processImageMeme(message, args, 305, 117, 30, 25, "bernie.png", "static/bernie.png");
    }
};