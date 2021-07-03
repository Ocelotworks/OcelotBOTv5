module.exports = {
    name: "Restore queue",
    usage: "restore [number/view]",
    commands: ["requeue", "req", "restore"],
    hidden: true,
    run: async function (context, bot) {

        let previousQueues;

        let guild = context.guild.id;
        if (!bot.music.listeners[guild]) {
            previousQueues = await bot.database.getPreviousQueue(guild);
        } else {
            previousQueues = await bot.database.getPreviousQueue(guild, bot.music.listeners[guild].id);
        }

        if (previousQueues.length === 0)
            return context.send(":spider_web: You have no previous queues. If the bot leaves without finishing a queue, it is saved here.");

    }
};