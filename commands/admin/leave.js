module.exports = {
    name: "Leave Server",
    usage: "leave <server>",
    commands: ["leave"],
    init: function init(bot){
        if(bot.client.shard){
            bot.logger.log("Loading shard receiver for !admin leave");
            process.on("message", function(msg){
                if(msg.type === "leaveServer"){
                    const target = msg.message;
                    if (target) {
                        bot.logger.log("Leaving " + target.name);
                        target.leave();
                    }
                }
            });
        }
    },
    run: async function(message, args, bot){
        bot.rabbit.event({type: "leaveServer", message: args[2]});
        bot.logger.log("Left Server.");
    }
};