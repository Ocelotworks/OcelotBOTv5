/**
 * Created by Peter on 02/07/2017.
 */
module.exports = {
    name: "Spongebob",
    usage: "spongebob [text]",
    accessLevel: 0,
    commands: ["spongebob"],
    run: function run(user, userID, channel, message, args, event, bot, recv, debug, server) {
        var doSponge = function doSponge(input){
            var output = "";
            for(var i in input){
                if(input.hasOwnProperty(i))
                    if(Math.random() > 0.5)output+= input[i].toLowerCase();
                    else output+= input[i].toUpperCase();
            }
            recv.sendMessage({
                to: channel,
                message: output,
                embed: {
                    image: {
                        url: "http://i3.kym-cdn.com/entries/icons/original/000/022/940/spongebobicon.jpg"
                    }
                }
            });
        };

        if(!args[1]){
            recv.getMessages({
                channelID: channel,
                limit: 2
            }, function(err, resp){
                if(resp[1])
                    doSponge(err || resp[1].content);
                else{
                    recv.sendMessage({
                        to: channel,
                        message: ":bangbang: Please enter text to spongify."
                    })
                }
            });
        }else{
            doSponge(message.substring(10));
        }

    }
};