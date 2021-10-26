const Embeds = require("../util/Embeds");
module.exports = {
    name: "User Banner",
    usage: "banner :@user?",
    usageExample: "banner @Big P",
    detailedHelp: "Get a user's banner. Or your own.",
    categories: ["image", "tools"],
    requiredPermissions: ["EMBED_LINKS"],
    commands: ["banner"],
    guildOnly: true,
    run: async function (context) {
        let target = context.options.user ? await context.guild.members.fetch(context.options.user).catch(()=>null) : context.member;
        if(!target)
            return context.replyLang({ephemeral: true, content: "AVATAR_NOT_FOUND"});
        await target.user.fetch();
        if(!target.user.banner)
            return context.sendLang("BANNER_NO_BANNER");
        const embed = new Embeds.AuthorEmbed(context);
        embed.setColor(target.displayColor);
        embed.setImage(target.user.bannerURL({dynamic: true, format: "png", size: 4096}))
        embed.setTitleLang("BANNER", {username: target.displayName});
        return context.send({embeds: [embed]});
    }
};