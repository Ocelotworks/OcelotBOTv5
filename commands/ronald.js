module.exports = {
    name: "Ronald Says",
    usage: "ronald <text>",
    rateLimit: 10,
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["ronald", "ronaldsays", "mcdonald"],
    categories: ["image", "fun", "memes"],
    unwholesome: true,
    run:  function(message, args, bot){
        bot.util.processImageMeme(message, args, 207, 77, 15, 15, "ronaldsays.png", "static/ronald.png");
    }
};