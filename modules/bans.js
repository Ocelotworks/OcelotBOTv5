module.exports = {
    name: "Bans",
    init: function(bot){

       bot.banCache = {
           user:   [],
           channel:[],
           server: [],
           update: async function(){
               bot.banCache.user = [];
               bot.banCache.channel = [];
               bot.banCache.server = [];
               const bans = await bot.database.getBans();

               for(let i = 0; i < bans.length; i++){
                   const ban = bans[i];
                   bot.banCache[ban.type].push(ban.id);
               }
           }
       };

       bot.banCache.update();

        process.on("message", function updateBans(msg){
            if(msg.type === "updateBans") {
                bot.logger.log("Updating Ban List");
                bot.banCache.update();
            }
        });

       bot.checkBan = function checkBan(message){
            if(message.guild && bot.banCache.server.indexOf(message.guild.id) > -1)return true;
            if(message.channel && bot.banCache.channel.indexOf(message.channel.id) > -1)return true;
            return bot.banCache.user.indexOf(message.author.id) > -1;
       };
    }
};