module.exports = {
    name: "Jesus Meme",
    usage: "jesus <text>",
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["jesus"],
    categories: ["image", "fun", "memes"],
    run:  function(message, args, bot){
        bot.util.processImageMeme(message, args, 120, 144, 23, 10, "jesus.png", "static/jesus.png");
    }
};