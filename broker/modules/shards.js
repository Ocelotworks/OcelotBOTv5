/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 06/05/2019
 * ╚════ ║   (ocelotbotv5) manager
 *  ════╝
 */
const {ShardingManager} = require('discord.js');
const config = require('config');
module.exports = {
    name: "Shard Manager",
    init: function (broker) {

        broker.lastCrash = new Date();

        broker.crashes = [];

        broker.manager =  new ShardingManager(`${__dirname}/../../ocelotbot.js`, JSON.parse(JSON.stringify(config.get("Discord"))));
        broker.manager.spawn();

        broker.manager.on('launch', function launchShard(shard) {
            broker.logger.log(`Successfully launched shard ${shard.id+1}/${broker.manager.totalShards} (ID: ${shard.id})`);
            let closeListener = function processClosed(code){
                broker.logger.warn("Process exited with code "+code);
                if(code !==  0) {
                    broker.lastCrash = new Date();
                    broker.crashes[shard.id] ? broker.crashes[shard.id]++ : broker.crashes[shard.id] = 1;
                }
            };
            shard.process.on('exit', closeListener);

            shard.on("death", function(){
                broker.logger.log("Shard died");
                if(closeListener)
                    shard.process.removeListener("exit", closeListener);
            });
        });




    }
};