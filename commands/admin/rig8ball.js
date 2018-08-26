module.exports = {
    name: "Rig 8-ball",
    usage: "rig8ball <number>",
    commands: ["rig8ball"],
    run: async function(message, args, bot){
       if(!args[2] || !parseInt(args[2])){
           message.channel.send("Invalid usage: !admin rig8ball <number> Where number is the ID of the response.");
       }else{
           if(args[2] === "-1"){
               bot.rig8ball = null;
               message.channel.send("Cleared.");
           }else{
               bot.rig8ball = parseInt(args[2]);
               message.channel.send(`Set message to: \`${bot.lang.getTranslationFor("en", `8BALL_RESPONSE_${bot.rig8ball}`)}\``);
           }
       }
    }
};