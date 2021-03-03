module.exports = {
    name: "User Avatar",
    usage: "avatar <@User>",
    usageExample: "avatar @Big P",
    detailedHelp: "Get a user's avatar. Or your own.",
    categories: ["image", "tools"],
    requiredPermissions: ["EMBED_LINKS"],
    commands: ["avatar"],
    run: function(message){
        let target = message.author;
        if(message.mentions && message.mentions.users && message.mentions.users.size > 0){
            target = message.mentions.users.first();
        }
        message.channel.send("", {
            embed:{
                title: `${target.username}'s Avatar:`,
                image: {
                    url: target.displayAvatarURL({dynamic: true, format: "png", size: 4096})
                }
            }

        })
    },
};