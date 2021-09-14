module.exports = (context)=>{
    if (!context.channel?.nsfw && context.commandData.categories.indexOf("nsfw") > -1) {
        context.replyLang({content: "GENERIC_NSFW_CHANNEL", ephemeral: true});
        return false;
    }
    return true;
}