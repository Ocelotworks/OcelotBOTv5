const {ShardingManager} = require('discord.js');
const config = require('config');
const logger = require('ocelot-logger');
const Raven = require('raven');

Raven.config(config.get("Raven.DSN")).install();


const manager = new ShardingManager(`${__dirname}/ocelotbot.js`, config.get("Discord"),);


manager.spawn();

manager.on('launch', function launchShard(shard) {
    logger.log(`Successfully launched shard ${shard.id+1}/${manager.totalShards} (ID: ${shard.id})`);
});

manager.on('message', function onMessage(process, message){
    if(message.type) {
        logger.log("Broadcasting message");
        manager.broadcast(message);
    }
});