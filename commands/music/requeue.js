module.exports = {
    name: "Restore queue",
    usage: "restore [number/view]",
    commands: ["requeue", "req", "restore"],
    hidden: true,
    run: async function (message, args, bot, music) {

        let previousQueues;

        let guild = message.guild.id;
        if(!music.listeners[guild]){
            previousQueues = await bot.database.getPreviousQueue(guild);
        }else{
            previousQueues = await bot.database.getPreviousQueue(guild, music.listeners[guild].id);
        }

        if(previousQueues.length === 0)
            return message.channel.send(":spider_web: You have no previous queues. If the bot leaves without finishing a queue, it is saved here.");

    }
};