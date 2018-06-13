const Discord = require('discord.js');
module.exports = {
    name: "Achievement Get!",
    usage: "achievement <text>",
    categories: ["image", "fun", "memes"],
    requiredPermissions: ["ATTACH_FILES"],
    commands: ["achievement", "acheivement", "ach", "achievment"],
    run:  function(message, args){
        if(!args[1]){
            message.channel.send(":bangbang: You must provide some text! i.e !achievement hello world");
            return;
        }

        message.channel.startTyping();
        let attachment = new Discord.Attachment(`https://mcgen.herokuapp.com/a.php?i=1&h=Achievement%20Get!&t=${encodeURIComponent(message.content.substring(args[0].length+1))}`, "ach.png");
        message.channel.send("", attachment);
        message.channel.stopTyping();
    }
};