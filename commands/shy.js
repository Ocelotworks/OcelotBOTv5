module.exports = {
    name: "Shy Meme",
    usage: "shy <text>",
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["shy"],
    rateLimit: 10,
    categories: ["image", "memes"],
    run:  function(message, args, bot){
        bot.util.processImageMeme(message, args, 30, 545, 23, 25, "shy.png", "static/shy.png");
    }
};