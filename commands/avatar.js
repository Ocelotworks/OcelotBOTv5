module.exports = {
    name: "User Avatar",
    usage: "avatar <@User>",
    usageExample: "avatar @Big P",
    detailedHelp: "Get a user's avatar. Or your own.",
    categories: ["image", "tools"],
    requiredPermissions: ["EMBED_LINKS"],
    commands: ["avatar"],
    slashHidden: true,
    run: function (message) {
        let target = message.author;
        if (message.mentions && message.mentions.users && message.mentions.users.size > 0) {
            target = message.mentions.users.first();
        }
        message.channel.send({
            embeds: [{
                title: `${target.username}'s Avatar:`,
                color: message.mentions.members.size > 0 ? message.mentions.members.first().displayColor : "#efefef",
                image: {
                    url: target.displayAvatarURL({dynamic: true, format: "png", size: 4096})
                }
            }]
        })
    },
};