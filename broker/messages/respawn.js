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
            if(broker.awaitingRestart.indexOf(i) === -1){
                broker.awaitingRestart.push(i);
            }else{
                broker.logger.warn(`Shard ${i} is already waiting to be respawned!`)
            }
        }
        if(broker.awaitingRestart.length > 0)
            broker.manager.shards.get(broker.awaitingRestart.pop()).respawn();
        console.log(broker.awaitingRestart);
    }
};