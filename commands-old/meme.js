/**
 * Created by Peter on 01/07/2017.
 */
const async = require('async');
module.exports = {
    name: "Meme",
    usage: "meme <meme/list/add <name> <url>/globaladd <name> <url>",
    accessLevel: 0,
    commands: ["meme"],
    run: async function run(user, userID, channel, message, args, event, bot, recv, debug, server) {
    	if(channel == "318432654880014347")return;
        if(args.length < 2){
            recv.sendMessage({
                to: channel,
                message: `:bangbang: ${await bot.lang.getTranslation(server, "INVALID_USAGE")} !meme <meme/list/add <name> <url>/globaladd <name> <url>>`
            });
        }else{
            const arg = args[1].toLowerCase();
            if(arg === "list") {
                var result = await bot.database.getMemes(server);
                var globalMemes = "";
                var serverMemes = "";

                async.eachSeries(result, function (meme, cb) {
                    if (meme.server == "global") {
                        globalMemes += meme.name + " ";
                    } else {
                        serverMemes += meme.name + " ";
                    }
                    cb();
                }, async function () {
                	const serverInfo = await recv.getServerInfo(server);
                	const message = serverInfo ?
						`**${await bot.lang.getTranslation(server, "MEME_AVAILABLE_MEMES")}**\n__:earth_americas: **${await bot.lang.getTranslation(server, "MEME_GLOBAL_MEMES")}**__ ${globalMemes}\n__:house_with_garden:${await bot.lang.getTranslation(server, "MEME_SERVER", {serverName: serverInfo.name})}__ ${serverMemes == "" ? "No memes yet. Add them with !meme add" : serverMemes}` :
						`**${await bot.lang.getTranslation(server, "MEME_AVAILABLE_MEMES")}**\n__:earth_americas: **${await bot.lang.getTranslation(server, "MEME_GLOBAL_MEMES")}**__ ${globalMemes}`;
					if(message.length >= 2000){
						recv.sendMessage({
							to: channel,
							message: message.substring(0, 2000)
						});
						recv.sendMessage({
							to: channel,
							message: message.substring(2000)
						});
					}else{
						recv.sendMessage({
							to: channel,
							message: message
						});
					}
                });
			}else if(arg === "list-all" && userID == "139871249567318017"){
				var result = await bot.database.getAllMemes();
				var output = "";
				for(var i in result){
					var name = result[i].name;
					if(output.length +name.length+1 >= 1000){
						recv.sendMessage({
							to: channel,
							message: output
						});
						output = name;
					}else{
						output += " "+name;
					}
				}
				recv.sendMessage({
					to: channel,
					message: output
				});
            }else if(arg === "remove"){
				if(!args[2]){
					recv.sendMessage({
						to: channel,
						message: ":bangbang: Usage: !meme remove <meme>"
					});
				}else{
					try{
						const result = await bot.database.removeMeme(args[2].toLowerCase(), server, userID);
						if(result.affectedRows == 0){
							recv.sendMessage({
								to: channel,
								message: ":warning: Meme doesn't exist or you didn't add it. Only the person who added it can remove it.\nIf you still want it removed, do !meme report "+args[2]
							});
						}else{
							recv.sendMessage({
								to: channel,
								message: ":white_check_mark: Meme removed."
							});
						}
					}catch(e){
						bot.raven.captureException(e);
						bot.logger.error(e.stack);
						recv.sendMessage({
							to: channel,
							message: ":bangbang: Error removing meme. Try Again Later."
						});
					}
				}

            }else if(arg === "report") {
                recv.sendMessage({
                    to: "139871249567318017",
                    message: `Meme report: ${message}\nFrom: ${userID}\nIn ${channel}/${server.name}`
                }, function(){
                    recv.sendMessage({
                        to: channel,
                        message: "Meme reported successfully."
                    });
                });
            }else if(arg === "add") {
                if (args.length < 4){
                    if(!args[2]){
                        recv.sendMessage({
                            to: channel,
                            message: ":bangbang: You must enter a name and URL. !meme add <name> <URL>"
                        });
                    }else{
                        recv.sendMessage({
                            to: channel,
                            message: `:bangbang: You must enter a URL. !meme add ${args[2]} <URL>`
                        })
                    }
                }else {
                	try{
						await bot.database.addMeme(userID, server, args[2].toLowerCase(), message.substring(message.indexOf(args[3])).trim())
						recv.sendMessage({
							to: channel,
							message: "Meme added."
						});
					}catch(err){
						if(err.message.indexOf("duplicate")){
							recv.sendMessage({
								to: channel,
								message: "That meme already exists. Try a different name."
							});
						}else{
							recv.sendMessage({
								to: channel,
								message: "Error adding meme: " + err
							});
						}
					}
                }
            }else if(arg === "addglobal"){
				try{
					await bot.database.addMeme(userID, "global", args[2].toLowerCase(), message.substring(message.indexOf(args[3])).trim())
					recv.sendMessage({
						to: channel,
						message: "Meme added."
					});
				}catch(err){
					bot.raven.captureException(err);
					if(err.message.indexOf("duplicate")){
						recv.sendMessage({
							to: channel,
							message: "That meme already exists. Try a different name."
						});
					}else{
						recv.sendMessage({
							to: channel,
							message: "Error adding meme: " + err
						});
					}
				}
            }else{
            	try{
            		const result = await bot.database.getMeme(args[1].toLowerCase(), server);
					if(result.length < 1){
						recv.sendMessage({
							to: channel,
							message: ":bangbang: Meme not found, try !meme list"
						});
					}else{
						recv.sendMessage({
							to: channel,
							message: result[0].meme
						});
					}
				}catch(e){
					bot.raven.captureException(e);
					recv.sendMessage({
						to: channel,
						message: ":bangbang: Error getting meme. Try Again later."
					});
					bot.logger.error(e.stack);
				}
            }
        }

    }
};