module.exports = {
    name: "Make yourself Anonymous",
    usage: "anonymous on/off",
    commands: ["anonymous", "anonymise", "anonymize"],
    run: async function (message, args, bot) {
        let option;
        if(!args[2] || (option = args[2].toLowerCase()) !== "on" && option !== "off"){
            if(message.getBool("privacy.anonymous"))
                return message.channel.send(`You currently have anonymity turned ON, meaning that your Discord Tag will not show up anywhere on OcelotBOT. To turn this off, **${args[0]} ${args[1]} off**`);

            return message.channel.send(`For certain commands, your Discord Tag (e.g Big P#1843) may be displayed to other users. This includes, but isn't limited to:
- Getting a Guess record, or being on the leaderboard
- Being on the Trivia leaderboard
- Sending a Feedback
- Voting for OcelotBOT
- Owning a premium custom bot
If you don't want your Discord tag to be displayed anywhere, you can make yourself anonymous with **${args[0]} ${args[1]} on**.
This does not stop data being associated with your account. If you wish to remove all data associated with you from OcelotBOT refer contact **Big P#1843**
`)
        }
        const enabled = option === "on"
        await bot.database.setUserSetting(message.author.id, "privacy.anonymous", enabled);
        bot.rabbit.event({type: "reloadUserConfig"});
        // Shorthand hell
        return message.channel.send(`${enabled ? "Enabled" : "Disabled"} anonymity. You can ${enabled ? "disable" : "enable"} it at any time with ${args[0]} ${args[1]} ${enabled ? "off" : "on"}`);
    }
};