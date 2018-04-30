/**
 * Created by Peter on 03/07/2017.
 */
module.exports = {
    id: "channelinfo",
    run: function run(user, userID, channel, message, args, event, bot, recv){
        recv.getChannelInfo(args[2], function(err, thisChannel){
            if(err){
                recv.sendMessage({
                    to: channel,
                    message: err
                });
            }else if(!thisChannel){
                recv.sendMessage({
                    to: channel,
                    message: "That channel doesn't exist."
                });
            }else if(!thisChannel.guild_id){
                recv.sendMessage({
                    to: channel,
                    message: "That channel is a DM channel probably"
                });
            }else{
                recv.getServerInfo(thisChannel.guild_id, function(err, thisServer){
                    if(!thisServer){
                        recv.sendMessage({
                            to: channel,
                            message: "This channel does not exist."
                        });
                    }else if(thisServer === "DM"){
                        recv.getUser(channelID, function(err, thisUser){
                            recv.sendMessage({
                                to: channel,
                                message: `This is a direct message from ${thisUser.username}`
                            });
                        });

                    }else{
                        recv.sendMessage({
                            to: channel,
                            message: `Channel **#${thisChannel.name}** belongs to server **${thisServer.name}** (${thisServer.id}). It has ${thisServer.member_count} members.\nhttp://unacceptableuse.com:3005/#!/servers/${thisServer.id}`
                        });
                    }
                });
            }
        });
    }
};