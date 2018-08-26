module.exports = {
    name: "Set Topical Compliment",
    usage: "settopicalcompliment <compliment>",
    commands: ["settopicalcompliment", "stc"],
    run: function(message, args, bot){
        if(!args[2]){
            message.channel.send("Invalid usage: !admin setTopicalCompliment <compliment>");
        }else{
            const compliment = args[3] === "clear" ? null : message.content.substring(message.content.indexOf(args[2]));
            bot.topicalCompliment = compliment;
            message.channel.send(`Setting topical compliment to: '${compliment}'`);
        }
    }
};