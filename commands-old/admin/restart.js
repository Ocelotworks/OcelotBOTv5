/**
 * Created by Peter on 03/07/2017.
 */
module.exports = {
    id: "restart",
    run: function run(user, userID, channel, message, args, event, bot, recv){
        recv.sendMessage({
            to: channel,
            message: `Restarting...`
        }, function(){
            process.exit(1);
        });

    }
};