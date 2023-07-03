module.exports = {
    name: "Make yourself Anonymous",
    usage: "anonymous [mode?:on,off]",
    commands: ["anonymous", "anonymise", "anonymize"],
    run: async function (context, bot) {
        let option;
        if(!context.options.mode){
            if(context.getBool("privacy.anonymous"))
                return context.send(`You currently have anonymity turned ON, meaning that your Discord Tag will not show up anywhere on OcelotBOT. To turn this off, **${context.command} anonymous off**`);

            return context.send(`For certain commands, your Discord Tag (e.g Big P#1843) may be displayed to other users. This includes, but isn't limited to:
- Getting a Guess record, or being on the leaderboard
- Being on the Trivia leaderboard
- Sending a Feedback
- Voting for OcelotBOT
- Owning a premium custom bot
Your current nickname also has a random chance of being applied to someone else if you use ${context.getSetting("prefix")}newnick
If you don't want your Discord tag to be displayed anywhere, you can make yourself anonymous with **${context.getSetting("prefix")}privacy ${context.options.command} on**.
This does not stop data being associated with your account. If you wish to remove all data associated with you from OcelotBOT forever contact **${bot.util.ownerTag}**
`)
        }
        const enabled = context.options.mode === "on"
        await bot.database.setUserSetting(context.user.id, "privacy.anonymous", enabled);
        bot.rabbit.event({type: "reloadUserConfig"});
        // Shorthand hell
        return context.send(`${enabled ? "Enabled" : "Disabled"} anonymity. You can ${enabled ? "disable" : "enable"} it at any time with ${context.command} ${context.options.command} ${enabled ? "off" : "on"}`);
    }
};