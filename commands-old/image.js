/**
 * Created by Peter on 01/07/2017.
 */
const request = require('request');
const config = require('config');
module.exports = {
    name: "Reddit Image Viewer",
    usage: "image <subreddit>",
    accessLevel: 0,
    commands: ["image"],
    run: async function run(user, userID, channel, message, args, event, bot, recv, debug, server) {
        if(args.length < 2){
            recv.sendMessage({
                to: channel,
                message: await bot.lang.getTranslation(server, "IMAGE_NO_SUBREDDIT")
            });
        }else{
            const subreddit = args[1].replace("r/", "");
            request({
                url: `https://api.reddit.com/r/${subreddit}`,
                headers: {
                    'User-Agent': config.get("Commands.image.userAgent")
                }
            }, async function(err, resp, body){
                if(err){
                    recv.sendMessage({
                        to: channel,
                        message:  await bot.lang.getTranslation(server, "IMAGE_ERROR")
                    });
                    bot.logger.error(err.message);
                }else{
                    try {
                        var data = JSON.parse(body);
                        if (data.error) {
                            var message = "";
                            switch (data.error) {
                                case 404:
                                    message = await bot.lang.getTranslation(server, "IMAGE_BANNED");
                                    break;
                                case 403:
                                    message = await bot.lang.getTranslation(server, "IMAGE_QUARANTINED");
                                    break;
                                default:
                                    message = await bot.lang.getTranslation(server, "IMAGE_ERROR");
                                    break;

                            }
                            recv.sendMessage({
                                to: channel,
                                message: message
                            });
                        } else {
                            var data = data.data;
                            if (data.children.length === 0) {
                                recv.sendMessage({
                                    to: channel,
                                    message: await bot.lang.getTranslation(server, "IMAGE_NO_POSTS")
                                });
                            } else {
                                const posts = data.children;
                                var randPost;

                                for (var i = 0; i < 50; i++) {
                                    randPost = posts[parseInt(Math.random() * posts.length)];
                                    if (randPost.data.selftext_html === null &&
                                        (randPost.data.url.indexOf("imgur.com") > -1 ||
                                        randPost.data.url.indexOf("i.redd.it") > -1 ||
                                        randPost.data.url.indexOf(".png") > -1 ||
                                        randPost.data.url.indexOf(".jp") > -1)) {
                                        break;
                                    }
                                }
                                if(i === 50){
                                    recv.sendMessage({
                                        to: channel,
                                        message: await bot.lang.getTranslation(server, "IMAGE_NO_IMAGES")
                                    });
                                }else{
                                    recv.sendMessage({
                                        to: channel,
                                        message: randPost.data.url,
                                        embed: {
                                            title: randPost.data.title,
                                            image: {
                                                url: randPost.data.url
                                            }
                                        }
                                    });
                                }
                            }
                        }
                    }catch(e){
						bot.raven.captureException(e);
                        recv.sendMessage({
                            to: channel,
                            message: await bot.lang.getTranslation(server, "IMAGE_INVALID_RESPONSE")
                        });
                        bot.logger.error(e.stack);
                    }
                }
            });
        }

    }
};