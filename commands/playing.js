const substitutes = {
    "gmod": "Garry's Mod",
    "lol": "League of Legends",
    "ark": "ARK: Survival Evolved",
    "csgo": "Counter-Strike: Global Offensive",
    "cs go": "Counter-Strike: Global Offensive",
    "cs:go": "Counter-Strike: Global Offensive",
    "counterstrike": "Counter-Strike: Global Offensive",
    "gtav": "Grand Theft Auto V",
    "gta5": "Grand Theft Auto V",
    "gta": "Grand Theft Auto V",
    "rainbow 6": "Rainbow Six Siege",
    "r6": "Rainbow Six Siege",
    "ftl": "FTL: Faster Than Light",
    "faster than light": "FTL: Faster Than Light",
    "battlefield 5": "Battlefield™ V",
    "battlefield v": "Battlefield™ V",
    "tf2": "Team Fortress 2",
    "tf": "Team Fortress"
};

function getCountFunction(term){
    return "("+(function getCount(safeTerm) {
        let termFixed;
        let count = 0;
        let term = Buffer.from(safeTerm, 'base64').toString();
        const array = this.users.array();
        console.log(`Iterating over ${array.length} keys`);
        for (let i = 0; i < array.length; i++) {
            const user = array[i];
            if (user.presence && user.presence.game && user.presence.game.name.toLowerCase() === term) {
                count++;
                if (!termFixed)
                    termFixed = user.presence.game.name;
            }
        }
        return [count, termFixed];
    }).toString()+`).apply(this, ['${Buffer.from(term).toString('base64')}'])`
}

module.exports = {
    name: "Playing stats",
    usage: "playing <game>",
    categories: ["tools"],
    commands: ["playing", "playingstats", "game"],
    run: async function run(message, args, bot) {
       if(!args[1]){
           message.channel.send(`:bangbang: Usage ${args[0]} <game> Try: ${args[0]} Fortnite`);
       }else{

           let term = message.content.substring(message.content.indexOf(args[1])).toLowerCase();
           if(substitutes[term])
               term = substitutes[term].toLowerCase();
           message.channel.send(`Looking for '${term}' players...`);
           message.channel.startTyping();
           let results = await bot.client.shard.broadcastEval(getCountFunction(term));
           let count = results.reduce((prev, val) => prev + (val && val[0]), 0);
           let termFixed = results[0][1];
           message.channel.send(`:information_source: **${count.toLocaleString()}** users playing **${termFixed || term}**`);
           message.channel.stopTyping(true);
       }
    }
};