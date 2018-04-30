const   gm      = require('gm'),
		fs      = require('fs'),
		request = require('request'),
		config  = require('config').get("Commands.sexysingle");
module.exports = {
	name: "Sexy Singles Ad Generator",
	usage: "sexysingle <user>",
	accessLevel: 0,
	commands: ["sexysingle", "sexy", "single"],
	run: async function run(user, userID, channel, message, args, event, bot, recv, debug, server){
		if(!await bot.util.hasPermission(channel, "146293573422284800", bot.util.PERMISSIONS.attachFiles)){
			console.log("No permissions");
			recv.sendMessage({
				to: channel,
				message: ":warning: This command requires the permission **Attach Files**"
			});
			return;
		}
		if(!args[1]){
			recv.sendMessage({
				to: channel,
				message: await bot.lang.getTranslation(server, "CRUSH_NO_USER")
			});
		}else{
			bot.ipc.emit("instanceBusy", {instance: bot.instance});
			const target = args[1].replace(/[!@<>]/g, "");
			const isUrl = target.startsWith("http");
			recv.getUser(target, async function(err, targetUser){
				if(!isUrl && !targetUser && target !== "everyone"){
					recv.sendMessage({
						to: channel,
						message: await bot.lang.getTranslation(server, "CRUSH_INVALID_USER")
					});
				}else{
					recv.simulateTyping(channel);
					if(target === "everyone"){
						var serverInfo = await recv.getServerInfo(server);
						if(!serverInfo){
							recv.sendMessage({
								to: channel,
								message: await bot.lang.getTranslation(server, "CRUSH_INVALID_SERVER")
							})
						}else if(serverInfo.icon){
							const fileName = `${config.get("dir")}icon-${encodeURIComponent(serverInfo.icon)}.png`;
							const outputFile = `${config.get("dir")}sexysingle-${encodeURIComponent(serverInfo.icon)}.png`;
							downloadOrGet(`https://cdn.discordapp.com/icons/${server}/${serverInfo.icon}.webp`, fileName, outputFile);
						}else{
							recv.sendMessage({
								to: channel,
								message: await bot.lang.getTranslation(server, "CRUSH_INVALID_ICON")
							})
						}
					}else if(targetUser && targetUser.avatar){

						const fileName = `${config.get("dir")}avatar-${encodeURIComponent(targetUser.avatar)}.png`;
						const outputFile = `${config.get("dir")}sexysingle-${encodeURIComponent(targetUser.avatar)}.png`;
						downloadOrGet(`https://cdn.discordapp.com/avatars/${target}/${targetUser.avatar}.png?size=256`, fileName, outputFile);
					}else if(isUrl){
						const fileName = `${config.get("dir")}avatar-${encodeURIComponent(target)}.png`;
						const outputFile = `${config.get("dir")}sexysingle-${encodeURIComponent(target)}.png`;
						downloadOrGet(target, fileName, outputFile);

					}else{
						recv.sendMessage({
							to: channel,
							message: await bot.lang.getTranslation(server, "CRUSH_INVALID_ICON")
						});
					}

					function downloadOrGet(url, fileName, outputFile){
						if(fs.existsSync(outputFile)){
							bot.logger.log("Using cached crush file");
							recv.uploadFile({
								to: channel,
								file: outputFile,
								filename: config.get("filename"),
								filetype: "png"
							}, async function uploadFileCB(err){
								bot.ipc.emit("instanceFree", {instance: bot.instance});
								if(err){
									bot.raven.captureException(err);
									fs.unlink(outputFile, function deleteFileCB(err){
										if(err){
											bot.raven.captureException(err);
											bot.logger.error(`There was an error trying to delete ${outputFile}: ${err}`);
										}else{
											bot.logger.log(`Deleted ${outputFile}`);
										}
									});
									recv.sendMessage({
										to: channel,
										message: await bot.lang.getTranslation(server, "GENERIC_ERROR")
									})
								}
							});
						}else if(fs.existsSync(fileName)){
							bot.logger.log("Using cached avatar file");
							makeMeme(fileName, outputFile);
						}else if(isUrl){
							request(target).on("end", makeMeme).pipe(fs.createWriteStream(fileName));
						}else{
							bot.logger.log(`Downloading avatar of ${target}`);
							request(url)
								.on("end", function(){
									makeMeme(fileName, outputFile)
								})
								.pipe(fs.createWriteStream(fileName));
						}
					}

					function makeMeme(fileName, outputFile){
						gm(fileName)
							.resize(500, 500)
							.append(config.get("template"), true)
							.toBuffer('PNG', async function avatarToBuffer(err, buffer){
								if(err){
									bot.ipc.emit("instanceFree", {instance: bot.instance});
									recv.sendMessage({
										to: channel,
										message: await bot.lang.getTranslation(server, "CRUSH_ERROR")
									});
									bot.logger.error(`Error during avatar format stage of !crush: ${err.stack}`);
									fs.unlink(fileName, function(err){
										if(err){
											bot.logger.error("There was an error trying to delete " + fileName + ": " + err);
										}else{
											bot.logger.log("Deleted " + fileName);
										}
									});
								}else{
									recv.uploadFile({
										to: channel,
										file: buffer,
										filename: config.get("filename"),
										filetype: "png"
									}, function(err){
										console.log(err);
									});
									bot.ipc.emit("instanceFree", {instance: bot.instance});
									fs.writeFile(outputFile, buffer, function(err){
										if(err){
											bot.raven.captureException(err);
											bot.logger.warn(`Error caching crush file: ${err}`);
										}
									});
								}
							});
					}
				}

			});

		}
	}
};