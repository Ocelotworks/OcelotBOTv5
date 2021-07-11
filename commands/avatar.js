const Embeds = require("../util/Embeds");
module.exports = {
    name: "User Avatar",
    usage: "avatar :@user?",
    usageExample: "avatar @Big P",
    detailedHelp: "Get a user's avatar. Or your own.",
    categories: ["image", "tools"],
    requiredPermissions: ["EMBED_LINKS"],
    commands: ["avatar"],
    slashHidden: true,
    guildOnly: true,
    run: async function (context) {
        let target = context.options.user ? await context.guild.members.fetch(context.options.user) : context.member;
        const embed = new Embeds.AuthorEmbed(context);
        embed.setColor(target.displayColor);
        embed.setImage(target.user.displayAvatarURL({dynamic: true, format: "png", size: 4096}))
        embed.setTitleLang("AVATAR", {username: target.displayName});
        return context.send({embeds: [embed]});
    }
};