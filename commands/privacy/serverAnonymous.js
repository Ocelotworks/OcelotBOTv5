module.exports = {
    name: "Make your server Anonymous",
    usage: "serverAnonymous on/off",
    commands: ["serveranonymous", "serveranonymise", "serveranonymize"],
    run: async function (message, args, bot) {
        if(!bot.util.canChangeSettings(message))return message.channel.send("You must be Administrator or have the settings role to change this.");
        let option;
        if(!args[2] || ((option = bot.util.bools[args[2]]) === undefined)){
            if(message.getBool("privacy.serverAnonymous"))
                return message.channel.send(`This server currently has anonymity turned ON, meaning that elements from this server will not show up anywhere else. To turn this off, **${args[0]} ${args[1]} off**`);

            return message.channel.send(`The following commands will display elements from your server: 
- The ${message.getSetting("prefix")}emoji will display your server's emojis in other servers.
- Your server's name will show up when someone does ${message.getSetting("prefix")}userinfo on a member of this server.
If you do not want elements of your server to be shared with others, type **${args[0]} ${args[1]} on**.
This is separate from and does not override user's individual anonymity setting.
This does not stop data being associated with your server. If you wish to remove all data associated with you from OcelotBOT forever contact **Big P#1843**
`)
        }
        await bot.config.set(message.guild.id, "privacy.serverAnonymous", option);
        // Shorthand hell
        return message.channel.send(`${option ? "Enabled" : "Disabled"} server anonymity. You can ${option ? "disable" : "enable"} it at any time with ${args[0]} ${args[1]} ${option ? "off" : "on"}`);
    }
};