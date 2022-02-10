module.exports = async (context, bot)=>{
    if (!context.channel?.permissionsFor) return true;
    if (context.channel.type === "GUILD_PUBLIC_THREAD" && !context.channel.parent) return true;

    const permissions = await context.channel.permissionsFor(bot.client.user);

    if (!permissions || (context.message && !permissions.has("SEND_MESSAGES"))) {
        bot.logger.log({
            type: "commandPerformed",
            success: false,
            outcome: "No Permissions"
        })
        const dm = await context.user.createDM();
        dm.send(":warning: I don't have permission to send messages in that channel.");
        //TODO: COMMAND_NO_PERMS lang key
        return false;
    }

    if (context.commandData.requiredPermissions && !permissions.has(context.commandData.requiredPermissions)) {
        let permission = context.commandData.requiredPermissions.map((p) => bot.util.permissionsMap[p]).join();
        context.replyLang({content: "GENERIC_BOT_PERMISSIONS", ephemeral: true}, {permission});
        return false;
    }

    return true;
}
