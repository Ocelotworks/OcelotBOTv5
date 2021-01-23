module.exports = {
    name: "Handicapped Meme",
    usage: "handicap <text>",
    rateLimit: 10,
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["handicap", "handycap", "handicapped"],
    categories: ["image", "memes"],
    unwholesome: true,
    run:  function(message, args, bot){
        bot.util.processImageMeme(message, args, 275, 328, 30, 20, "handicap.png", "static/handicap.png");
    }
};