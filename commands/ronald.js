module.exports = {
    name: "Ronald Says",
    usage: "ronald <text>",
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["ronald", "ronaldsays"],
    categories: ["image", "fun", "memes"],
    run:  function(message, args, bot){
        bot.util.processImageMeme(message, args, 207, 77, 15, 15, "ronaldsays.png", "static/ronald.png");
    }
};