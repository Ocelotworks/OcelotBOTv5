/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 10/05/2019
 * ╚════ ║   (ocelotbotv5) reload
 *  ════╝
 */
module.exports = {
    name: "Respawn All",
    id: "respawn",
    init: function init(broker){
        broker.awaitingRestart = [];
    },
    received: function received(broker){
        broker.logger.warn("Respawning all shards.");
        for(let i = 0; i < broker.manager.totalShards; i++) {
            if(!broker.shardTasks[i]){
                broker.logger.log(`Shard ${i} can be restarted now`);
                setTimeout(function(){
                    broker.manager.shards.get(i).respawn();
                }, i*5000);
            }else if(broker.awaitingRestart.indexOf(i) === -1){
                broker.awaitingRestart.push(i);
            }else{
                broker.logger.warn(`Shard ${i} is already waiting to be respawned!`)
            }
        }
        console.log(broker.awaitingRestart);
    }
};