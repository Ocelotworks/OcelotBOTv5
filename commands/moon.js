//https://api.aerisapi.com/sunmoon/moonphases/search?query=type:new&limit=1&client_id=cManar2glgAGWOsCXTvA1&client_secret=RmYeTU4ulwL1Xb0wUDdfTETU5mcpqJO0mWDHaOkzdone

const request = require('request');
module.exports = {
    name: "Moon Phases",
    usage: "moon",
    commands: ["moon", "moonphase", "moonphases", "newmoon"],
    rateLimit: 30,
    categories: ["tools"],
    run: async function run(message, args, bot){
       request("https://api.aerisapi.com/sunmoon/moonphases/search?query=type:new&limit=1&client_id=cManar2glgAGWOsCXTvA1&client_secret=RmYeTU4ulwL1Xb0wUDdfTETU5mcpqJO0mWDHaOkz", function(err, resp, body){
           try{
               const now = new Date();

               const data = JSON.parse(body);
               console.log(data);
               const moon = new Date(data.response[0].timestamp*1000);
               const timeDiff = moon-now;
               message.channel.send(`The next new moon is in **${bot.util.prettySeconds(timeDiff/1000)}**:\n${moon}`)
           }catch(e){
                console.log(e);
           }
       })
    }
};