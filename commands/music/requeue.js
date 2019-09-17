module.exports = {
    name: "Re-queue previous",
    usage: "requeue [number/view]",
    commands: ["requeue", "req"],
    run: async function (message, args, bot, music) {

        let previousQueues;

        let guild = message.guild.id;
        if(!music.listeners[guild]){
            previousQueues = await bot.database.getPreviousQueue(guild);
        }else{
            previousQueues = await bot.database.getPreviousQueue(guild, music.listeners[guild].id);
        }

        if(previousQueues.length === 0)
            return message.channel.send(":cobeb")


    }
};