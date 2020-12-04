const validName = /[a-z_]{2,32}/gi
module.exports = {
    name: "Steal Emoji",
    usage: "esteal <URL or emoji>",
    categories: ["tools"],
    requiredPermissions: ["MANAGE_EMOJIS"],
    commands: ["esteal", "emojisteal", "steal"],
    run: async function(message, args, bot){
        if(!message.guild)return message.replyLang("GENERIC_DM_CHANNEL");
        if(!message.member.hasPermission("MANAGE_EMOJIS"))return message.channel.send("You must have the Manage Emojis permission to use this command.");
        let url, name;
        if(args[1] && (args[1].startsWith("<a:") || args[1].startsWith("<:"))) {
            const colonSplit = args[1].split(":");
            name = colonSplit[1];
            const ext = args[1].startsWith("<a:") ? "gif" : "png";
            const id = colonSplit[2].substring(0, colonSplit[2].length-1);
            url = `https://cdn.discordapp.com/emojis/${id}.${ext}`;
        }else{
            url = await bot.util.getImage(message, args);
            if(!url)return message.channel.send("Unable to find an image. Try including an emoji in the command or attaching an image.");
            const urlSplit = url.split("/");
            name = urlSplit[urlSplit.length-1].split(".")[0];
            if(!validName.test(name))name = message.id;
        }
        try {
            let result = await message.guild.emojis.create(url, name, {reason: "Steal emoji command"});
            message.channel.send(`Successfully created emoji ${name}: ${result}.`);
        }catch(e){
            console.log(e);
            message.channel.send(`Failed to create emoji. Make sure that you have enough slots available, and that the image isn't too big. (${e.message})`);
        }

    }
};