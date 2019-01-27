module.exports = {
    name: "Playing stats",
    usage: "playing <game>",
    categories: ["tools"],
    commands: ["playing", "playingstats", "game"],
    run: function run(message, args, bot) {
       if(!args[1]){
           message.channel.send(`:bangbang: Usage ${args[0]} <game> Try: ${args[0]} Fortnite`);
       }else{
           const term = message.content.substring(message.content.indexOf(args[1])).toLowerCase();
           let count = 0;
           let termFixed;
           const array = bot.client.users.array();
           console.log(`Iterating over ${array.length} keys`);
           for(let i = 0; i < array.length; i++){
               const user = array[i];
               if(user.presence && user.presence.game && user.presence.game.name.toLowerCase() === term) {
                   count++;
                   if(!termFixed)
                       termFixed = user.presence.game.name;
               }
           }
           message.channel.send(`:information_source: ${count} users playing **${termFixed || term}**`);
       }
    }
};