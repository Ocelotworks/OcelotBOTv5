module.exports = {
    name: "Make your server Anonymous",
    usage: "serverAnonymous [mode?:on,off]",
    commands: ["serveranonymous", "serveranonymise", "serveranonymize"],
    run: async function (context, bot) {
        if(!bot.util.canChangeSettings(context))return context.send("You must be Administrator or have the settings role to change this.");
        let option;
        if(!context.options.mode){
            if(context.getBool("privacy.serverAnonymous"))
                return context.send(`This server currently has anonymity turned ON, meaning that elements from this server will not show up anywhere else. To turn this off, **${context.command} ${args[1]} off**`);

            return context.send(`The following commands will display elements from your server: 
- The ${context.getSetting("prefix")}emoji will display your server's emojis in other servers.
- Your server's name will show up when someone does ${context.getSetting("prefix")}userinfo on a member of this server.
If you do not want elements of your server to be shared with others, type **${context.getSetting("prefix")}${context.command} ${context.options.command} on**.
This is separate from and does not override user's individual anonymity setting.
This does not stop data being associated with your server. If you wish to remove all data associated with you from OcelotBOT forever contact **Big P#1843**
`)
        }
        await bot.config.set(context.guild.id, "privacy.serverAnonymous", context.options.mode === "on");
        // Shorthand hell
        return context.send(`${option ? "Enabled" : "Disabled"} server anonymity. You can ${option ? "disable" : "enable"} it at any time with ${context.command} ${context.options.command} ${option ? "off" : "on"}`);
    }
};