module.exports = {
    name: "Force Spook",
    usage: "forceSpook <user>",
    commands: ["forcespook"],
    run: async function(message, args, bot){
        const target = message.mentions.users.first();
        await bot.database.spook(target.id, message.author.id, message.guild.id);
        message.channel.send(`:ghost: **<@${target.id}> has been spooked!**\nThey are now able to spook anyone else on the server.\n**The person who is spooked at midnight on the 31st of October loses!**`);

    }
};