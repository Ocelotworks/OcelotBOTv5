module.exports = {
    name: "Set Birthday Channel",
    usage: "channel #name/clear" ,
    commands: ["setchannel", "channel"],
    init: async function init(bot){
        bot.client.once("ready", ()=>{
            const now = new Date();
            let date = new Date();
            if(date.getHours() >= 10) {
                date.setDate(date.getDate()+1);
            }
            date.setHours(10, 0, 0, 0);
            let initialTimer = date-now;
            bot.logger.log(`Sending birthday messages in ${initialTimer}ms`);
            setTimeout(processChannels, initialTimer, bot);
        });
    },
    run: async function(message, args, bot){
        if(!message.member.hasPermission("MANAGE_CHANNELS"))return message.channel.send("You must have the Manage Channels permission to use this command.");
        let target = message.channel.id;
        if(message.mentions.channels.size > 0)
            target = message.mentions.channels.first().id;

        if(args[2] && args[2].toLowerCase() === "clear"){
            await bot.config.set(message.guild.id, "birthday.channel", null);
            message.channel.send("The Birthdays channel has been disabled.");
        }else{
            await bot.config.set(message.guild.id, "birthday.channel", target);
            message.channel.send(`The Birthdays channel has been set to <#${target}>. At 10AM GMT, any birthdays on that day will be announced! To disable this, do **${args[0]} ${args[1]} clear**`)
        }
    }
};


async function processChannels(bot){
    if(bot.drain)return;
    setTimeout(processChannels,8.64e7, bot);
    let birthdays = await bot.database.getBirthdaysTodayForShard(bot.client.guilds.cache.keyArray());
    bot.logger.log(`Got ${birthdays.length} birthdays today.`);
    const nowYear = new Date().getFullYear();
    for(let i = 0; i < birthdays.length; i++){
        try {
            const birthday = birthdays[i];
            let birthdayChannelId = bot.config.get(birthday.server, "birthday.channel", birthday.user);
            if (!birthdayChannelId) continue;
            let birthdayChannel = await bot.client.channels.fetch(birthdayChannelId);
            const age = nowYear - new Date(birthday.birthday).getFullYear();
            if (age > 13) {
                birthdayChannel.send(`:tada: Today is <@${birthday.user}>'s ${bot.util.getNumberPrefix(age)} birthday!`);
            } else {
                birthdayChannel.send(`:tada: Today is <@${birthday.user}>'s birthday!`);
            }
        }catch(e){
            bot.raven.captureException(e);
            console.error(e);
        }
    }
}