const Util = require("../util/Util");
const validName = /[a-z_]{2,32}/gi
module.exports = {
    name: "Steal Emoji",
    usage: "esteal :image? :name?",
    categories: ["tools"],
    requiredPermissions: ["MANAGE_EMOJIS_AND_STICKERS"],
    commands: ["esteal", "emojisteal", "steal"],
    guildOnly: true,
    userPermissions: ["MANAGE_EMOJIS_AND_STICKERS"],
    run: async function (context, bot) {
        let url, name;
        let isEmoji = false;
        if (context.options.image && (context.options.image.startsWith("<a:") || context.options.image.startsWith("<:"))) {
            const colonSplit = context.options.image.split(":");
            name = context.options.name || colonSplit[1];
            const ext = context.options.image.startsWith("<a:") ? "gif" : "png";
            const id = colonSplit[2].substring(0, colonSplit[2].length - 1);
            url = `https://cdn.discordapp.com/emojis/${id}.${ext}`;
            isEmoji = true;
        } else {
            url = await Util.GetImage(bot, context);
            if (!url) return context.send("Unable to find an image. Try including an emoji in the command or attaching an image.");
            const urlSplit = url.split("/");
            name = urlSplit[urlSplit.length - 1].split(".")[0];
            if (!validName.test(name)) name = context.message?.id || context.interaction.id;
        }

        if(!isEmoji && context.options.name && context.options.name !== url){
            name = context.options.name;
        }else if(!isEmoji && context.options.image && context.options.image !== url){
            name = context.options.image;
        }
        try {
            let result = await context.guild.emojis.create(url, name, {reason: "Steal emoji command"});
            context.send(`Successfully created emoji ${name}: ${result}.`);
        } catch (e) {
            console.log(e);
            context.send(`Failed to create emoji. Make sure that you have enough slots available, and that the image isn't too big. (${e.message})`);
        }

    }
};