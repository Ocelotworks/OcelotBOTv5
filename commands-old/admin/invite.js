/**
 * Created by Peter on 12/07/2017.
 */
module.exports = {
    id: "invite",
    run: function run(user, userID, channel, message, args, event, bot, recv){
       recv.createInvite({
           channelID: args[2],
           max_users: 1,
           max_age: 1200
       }, function(err, resp){
          if(err){
              recv.sendMessage({
                  to: channel,
                  message: ":bangbang: Error creating invite:\n"+err
              });
          }else{
              recv.sendMessage({
                  to: channel,
                  message: "https://discord.gg/"+resp.code
              });
          }
       });
    }
};
