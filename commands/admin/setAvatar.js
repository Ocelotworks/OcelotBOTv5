module.exports = {
    name: "Set Avatar",
    usage: "avatar <path>",
    commands: ["avatar", "setavatar"],
    run: async function(message, args, bot){
        if(args[1]){
            try {
                bot.client.user.setAvatar(args[1]);
            }catch(e){
                message.channel.send(e.message);
            }
        }else{
            message.channel.send("Usage: !admin avatar <path>");
        }
    }
};