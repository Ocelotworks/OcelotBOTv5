const dateformat = require('dateformat');
module.exports = {
    name: "Random Quote",
    usage: "quote [user] [phrase]",
    categories: ["tools"],
    requiredPermissions: [],
    commands: ["quote"],
    hidden: true,
    run: async function(message, args, bot){
        // noinspection EqualityComparisonWithCoercionJS
        if(message.guild.id != "478950156654346292")return;
        if(!args[1]){
            message.channel.send(`You must enter a user i.e \`${message.getSetting("!")}quote peter\` or \`${(message.guild && bot.prefixCache[message.guild.id]) || "!"}quote joel high\` or \`${(message.guild && bot.prefixCache[message.guild.id]) || "!"}quote anyone fuck\``);
        }else{
            const target = args[1].toLowerCase() === "anyone" ? null : args[1].toLowerCase();
            const phrase = args[2] ? message.content.substring(message.content.indexOf(args[2])) : null;
            message.channel.startTyping();
            const result = await bot.database.getMessageFrom(target, phrase);
            const row = result[0];
            console.log(phrase);
            if(!row){
                message.channel.send("Couldn't find a message matching that.");
            }else{
                message.channel.send(`[${dateformat(new Date(row.time), 'UTC:dd/mm/yy HH:MM:ss Z')}] <${row.user}> ${row.message}\n`);
            }
            message.channel.stopTyping(true);

        }
    }
};