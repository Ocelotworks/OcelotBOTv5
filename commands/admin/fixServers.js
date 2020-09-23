/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 20/04/2019
 * ╚════ ║   (ocelotbotv5) fixServers
 *  ════╝
 */
module.exports = {
    name: "Fix Servers",
    usage: "fixservers",
    commands: ["fixservers"],
    init: function(bot){
      process.on("message", function fixServers(message){
            if(message.type === "fixServers"){
                let timeout = bot.client.shard.ids.join(";") * 20000;
                bot.logger.log(`Fixing Servers in ${timeout}ms`);
                setTimeout(async function(){
                    const servers = bot.client.guilds.cache;
                    servers.forEach(async function(server){
                        try {
                            let databaseEntry = (await bot.database.getServer(server.id))[0];
                            if (!databaseEntry) {
                                bot.logger.warn(`${server.name} (${server.id}) does not exist in the database!`);
                                await bot.database.addServer(server.id, server.ownerID, server.name, server.joinedAt);
                                databaseEntry = {webhookID: null, webhookToken: null}; //It's called optimisation sweaty look it up
                            } else {
                                await bot.database.unleaveServer(server.id);
                                if (databaseEntry.name !== server.name) {
                                    bot.logger.warn(`${server.name} (${server.id}) name is wrong (${databaseEntry.name})`);
                                    await bot.database.updateServer(server.id, {name: server.name, owner: server.ownerID});
                                }
                            }

                            if (!databaseEntry.webhookID) {
                                //bot.logger.log("Server doesn't have a webhook.");
                                if (server.me.hasPermission("MANAGE_WEBHOOKS")) {
                                    let mainChannel = bot.util.determineMainChannel(server);
                                    if (mainChannel) {
                                        let webhook = await mainChannel.createWebhook("OcelotBOT", bot.client.avatar);
                                        bot.logger.log(`Created webhook for ${server.id}: ${webhook.id}`);
                                        await bot.database.addServerWebhook(server.id, webhook.id, webhook.token);
                                    } else {
                                       // bot.logger.warn("Couldn't get a main channel to create webhook in.")
                                    }
                                } else {
                                    //bot.logger.warn("No permission to create a webhook.");
                                }
                            }
                        }catch(e){
                            //bot.logger.error(`Failed for server ${server.name} (${server.id}): ${e}`);
                        }
                    });

                    if(bot.client.shard.ids.join(";") === 1){
                        let servers = await bot.database.getActiveServers();
                        for(let i = 0; i < servers.length; i++){
                            let row = servers[i];
                            if(row.server === "global" || row.server === "default")continue;
                            let result = await bot.client.shard.broadcastEval(`this.guilds.cache.has('${row.server}')`);
                            //onsole.log(result);
                            if(result.indexOf(true) > -1)
                                continue;
                            bot.logger.warn(`Server ${row.name} (${row.server}) was left`);
                            await bot.database.leaveServer(row.server, new Date(0));
                        }
                    }

                }, timeout);
            }
      });
    },
    run: function(message, args, bot){
       bot.client.shard.send({type: "fixServers"});
    }
};