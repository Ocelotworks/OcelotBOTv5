/**
 * Created by Peter on 09/06/2017.
 */
const pasync = require('promise-async');
module.exports = {
    name: "Server Settings",
    usage: "settings [set/help/list]",
    accessLevel: 1,
    commands: ["settings", "serversettings"],
    run: async function run(user, userID, channel, message, args, event, bot, recv, debug, server) {

        const settings = {
            prefix: {
                explanation: await bot.lang.getTranslation(server, "SETTINGS_PREFIX"),
                format: function format(value){
                    return "`"+value+"`";
                },
                onSet: function(newVal){
                    bot.prefixCache[server] = newVal;
                    bot.ipc.emit("broadcast", {event: "clearPrefixCache"});
                },
            },
            enableAutoReactions: {
                explanation: await bot.lang.getTranslation(server, "SETTINGS_REACTIONS"),
                format: function format(value){
                    return !!value;
                }
            },
            enableAutoReplies: {
                explanation: await bot.lang.getTranslation(server, "SETTINGS_REPLIES"),
                format: function format(value){
                    return !!value;
                }
            },
            allowNSFW: {
                explanation: await bot.lang.getTranslation(server, "SETTINGS_NSFW"),
                format: function format(value){
                    return !!value;
                }
            },
			language: {
            	//explanation: "The language to respond to commands in. To view the available languages, type !language",
				explanation: await bot.lang.getTranslation(server, "SETTINGS_LANGUAGE"),
				format: function(value){
            		return `${bot.lang.getTranslationFor(value, "LANGUAGE_FLAG")} \`${value}\``
				},
				onSet: function (newVal){
					bot.lang.languageCache[server] = newVal;
				}
			}
        };

        bot.database.getServer(server)
            .then(function(results){
                var serverInfo = results[0];
                var hasRole = false;
                var subCommands = {
                    "list": async function(){
                        var output = await bot.lang.getTranslation(server, "SETTINGS_AVAILABLE");
                        for(var i in serverInfo){
                            if(serverInfo.hasOwnProperty(i) && settings[i]){
                                output += `**${i}** - ${settings[i].format(serverInfo[i])}\n`
                            }
                        }
                        recv.sendMessage({
                            to: channel,
                            message: output
                        });
                    },
                    "set": async function(){
                        if(args.length < 4){
                            recv.sendMessage({
                                to: channel,
                                message: `:bangbang: You must supply a **setting** and a **value**:\n${bot.prefixCache[server]}settings set useServerCurrency false`
                            });
                        }else if(Object.keys(settings).indexOf(args[2]) > -1){
                        	try{
								await bot.database.setServerSetting(server, args[2], args[3] === "true" || args[3] === "false" ? args[3] === "true" : args[3]);
								recv.sendMessage({
									to: channel,
									message: `:white_check_mark: Successfully set ${args[2]} to **${args[3]}**`
								});
								if(settings[args[2]].onSet)
									settings[args[2]].onSet(args[3]);
							}catch(err){
								bot.raven.captureException(err);
								recv.sendMessage({
									to: channel,
									message: `Error setting value. Did you spell something wrong?:\n\`${err}\``
								})
							}
                        }else{
                            recv.sendMessage({
                                to: channel,
                                message: `:bangbang: Not a valid setting. Try ${bot.prefixCache[server]}settings list`
                            });
                        }
                    },
                    "help": function(){
                        if(Object.keys(settings).indexOf(args[2]) > -1){
                            recv.sendMessage({
                                to: channel,
                                message: settings[args[2]].explanation
                            });
                        }else{
                            recv.sendMessage({
                                to: channel,
                                message: `:bangbang: Not a valid setting. Try ${bot.prefixCache[server]}settings list.`
                            });
                            bot.logger.log(args[3]);
                        }
                    }
                };


                recv.getServerInfo(server, async function(err, serverData){
                	if(err){
						bot.raven.captureException(err);
					}else if(!serverData){
						recv.sendMessage({
							to: channel,
							message: ":warning: Either this is a DM channel, or there is an issue with the database connection.\nPlease use this command in a server, or try again later."
						})
					}else if(serverData.unavailable){
						recv.sendMessage({
							to: channel,
							message: ":warning: Discord gateway not currently connected to this server, try again later."
						});
					}else{
						if(debug){
							recv.sendMessage({
								to: channel,
								message: `\`\`\`json\n${JSON.stringify(serverData.members[userID].roles)}\n\`\`\``
							});
						}
						for(var i in serverData.members[userID].roles){
							if(serverData.members[userID].roles.hasOwnProperty(i)){
								var role = serverData.roles[serverData.members[userID].roles[i]];
								if(role.name.toLowerCase() === "bot controller"){
									hasRole = true;
									break;
								}
							}
						}

						if(!serverInfo){
							bot.logger.log("Creating server super-quick because it doesn't exist.");
							try{
								await bot.database.addServer(serverData.id, serverData.owner_id, serverData.name, serverData.joined_at);
							}catch(e){
								bot.raven.captureException(e);
								bot.logger.error(e.stack);
							}
						}
						//noinspection EqualityComparisonWithCoercionJS
						if(userID != "139871249567318017" && serverData.owner_id != userID && !hasRole){
							recv.sendMessage({
								to: channel,
								message: ":bangbang: You don't have permission to run this command! Only the server owner or people with the 'Bot Controller' role can do that."
							});
						}else{
							if(!args[1] || (args[1] === "help" && !args[2]) || !subCommands[args[1]]){
								recv.sendMessage({
									to: channel,
									message: `**Usage:**\n${bot.prefixCache[server]}settings help [setting] - This message or help on an individual setting\n${bot.prefixCache[server]}settings list - List the available settings and their current values\n${bot.prefixCache[server]}settings set [setting] [value] - Set a new value for a server setting`
								});
							}else{
								subCommands[args[1]]();
							}
						}
					}
				});
            });
    }
};