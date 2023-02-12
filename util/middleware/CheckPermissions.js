const Strings = require("../String");
module.exports = (context, bot) => {
    const subCommandData = context.commandData.subCommands?.[context.options.command];
    const commandData = context.commandData;
    // This feels wrong but I need to get the
    const guildOnly = commandData.guildOnly || subCommandData?.guildOnly;
    const noSynthetic = commandData.noSynthetic || subCommandData?.noSynthetic;
    const settingsOnly = commandData.settingsOnly || subCommandData?.settingsOnly;
    const userPermissions = commandData.userPermissions ? subCommandData?.userPermissions ? commandData.userPermissions.concat(subCommandData?.userPermissions) : commandData.userPermissions : subCommandData?.userPermissions;
    const adminOnly = commandData.adminOnly || subCommandData?.adminOnly;

    // Only allow Guild Only commands to be ran in a Guild
    if(guildOnly && !context.guild){
        context.replyLang({content: "GENERIC_DM_CHANNEL", ephemeral: true});
        return false;
    }

    // Don't allow this command inside custom commands
    if(context.message && context.message.synthetic && noSynthetic){
        context.replyLang({content: "GENERIC_CUSTOM_COMMAND", ephemeral: true})
        return false
    }

    // Override the next checks for admins
    if(context.getBool("admin"))return true;

    if(settingsOnly && !bot.util.canChangeSettings(context)){
        if(context.getSetting("settings.role") === "-")
            context.replyLang({content: "GENERIC_ADMINISTRATOR", ephemeral: true});
        else
            context.replyLang("SETTINGS_NO_ROLE", {role: context.getSetting("settings.role")});
        return false
    }

    if(context.getBool(`${context.command}.ignorePermissions`))
        return true

    // Check permissions in Guilds
    if(context.member && userPermissions && !context.channel?.permissionsFor(context.member)?.has(userPermissions)){
        context.replyLang({content: "GENERIC_USER_PERMISSIONS", ephemeral: true}, {permissions: userPermissions.map((p)=>Strings.Permissions[p]).join(", ")})
        return false
    }

    return !(adminOnly);
}