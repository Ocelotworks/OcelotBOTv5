module.exports = {
    name: "View Lang",
    usage: "lang <key>",
    commands: ["lang"],
    run: function(message, args, bot){
        if(!args[2]){
            message.channel.send("Invalid usage: !admin lang <lang>");
        }else{
           message.replyLang(args[2]);
        }
    }
};