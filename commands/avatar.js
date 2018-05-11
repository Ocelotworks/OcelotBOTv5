module.exports = {
    name: "User Avatar",
    usage: "avatar <@User>",
    requiredPermissions: ["EMBED_LINKS"],
    commands: ["avatar"],
    run: function(message){
        let target = message.author;
        if(message.mentions && message.mentions.users && message.mentions.users.size > 0){
            target = message.mentions.users.first();
        }
        message.channel.send("", {
            embed:{
                title: `${target.username}'s Avatar:`,
                image: {
                    url: target.avatarURL
                }
            }

        })
    }
};