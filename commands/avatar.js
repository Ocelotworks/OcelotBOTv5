module.exports = {
    name: "User Avatar",
    usage: "avatar :@user?",
    usageExample: "avatar @Big P",
    detailedHelp: "Get a user's avatar. Or your own.",
    categories: ["image", "tools"],
    requiredPermissions: ["EMBED_LINKS"],
    commands: ["avatar"],
    slashHidden: true,
    run: async function (context) {
        let target = context.options.user ? context.channel.members.get(context.options.user) :  context.member;
        return context.send({
            embeds: [{
                title: `${target.displayName}'s Avatar:`,
                color: target.displayColor,
                image: {
                    url: target.user.displayAvatarURL({dynamic: true, format: "png", size: 4096})
                }
            }]
        })
    },
};