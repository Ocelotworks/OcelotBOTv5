/**
 * Created by Peter on 06/07/2017.
 */
const request = require('request');
const config = require('config');
module.exports = {
    name: "Gfycat Search",
    usage: "gfy <search>",
    accessLevel: 0,
    commands: ["gfy", "gfycat", "gif"],
    hidden: true,
    run: function run(user, userID, channel, message, args, event, bot, recv, debug, server) {
        return false;
        request({
            url: `https://api.gfycat.com/v1/gfycats/search?search_text=${encodeURIComponent(message.substring(args[0].length))}`,
            headers: {
                "Authorization": ""
            }
        }, function(err, resp, body){
            if(err){
                recv.sendMessage({
                    to: channel,
                    message: `:bangbang: Could not contact gfycat. Try again later.`
                });
                bot.logger.error(err.message);
            }else{
                try{
                    var data = JSON.parse(body);
                    if(data.gfycats.length > 0){
                        var gfy = bot.util.arrayRand(data.gfycats);
                        recv.sendMessage({
                            to: channel,
                            message: gfy.title,
                            embed: {
                                image: {
                                    url: gfy.url
                                }
                            }
                        });
                    }else{
                        recv.sendMessage({
                            to: channel,
                            message: `:warning: No results found for that search. Try something else?`
                        });
                    }
                } catch(e){
                    recv.sendMessage({
                        to: channel,
                        message: ":bangbang: Error parsing response from gfycat. Try again later."
                    })
                }
            }
        });

    }
};