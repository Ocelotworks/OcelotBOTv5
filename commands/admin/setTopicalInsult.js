module.exports = {
    name: "Set Topical Insult",
    usage: "settopicalinsult <compliment>",
    commands: ["settopicalinsult", "sti"],
    run: function(message, args, bot){
        if(!args[2]){
            message.channel.send("Invalid usage: !admin setTopicalInsult <compliment>");
        }else{
            const insult = args[3] === "clear" ? null : message.content.substring(message.content.indexOf(args[2]));
            bot.topicalInsult = insult;
            message.channel.send(`Setting topical insult to: '${insult}'`);
        }
    }
};