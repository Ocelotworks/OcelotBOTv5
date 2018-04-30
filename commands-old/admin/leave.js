/**
 * Created by Peter on 03/07/2017.
 */
module.exports = {
    id: "leave",
    run: function run(user, userID, channel, message, args, event, bot, recv){
        recv.leaveServer(args[2]);
        recv.sendMessage({
            to: channel,
            message: `Left ${args[2]}`
        });
    }
};