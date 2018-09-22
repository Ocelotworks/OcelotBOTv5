module.exports = {
    name: "Say To",
    usage: "say channel <message>",
    commands: ["sayto"],
    init: function init(bot){
        if(bot.client.shard){
            bot.logger.log("Loading shard receiver for !admin sayTo");
            process.on("message", function(msg){
                if(msg.type === "sendMessage"){
                    const target = bot.client.channels.get(msg.message.target);
                    const message = msg.message.content;
                    if (target) {
                        target.send(message);
                    }
                }
            });
        }
    },
    run:  function(message, args, bot){
        const content = message.content.substring(message.content.indexOf(args[3]));
        bot.client.shard.send({type: "sendMessage", message: {content: content, target: args[2]}});
        message.channel.send("Sent");
    }
};