/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 03/11/2019
 * ╚════ ║   (ocelotbotv5) shardReady
 *  ════╝
 */
module.exports = {
    name: "Shard Ready",
    id: "ready",
    received: function received(broker, shard){
        broker.logger.log("Shard Ready");
        if(broker.awaitingRestart.length > 0)
            broker.manager.shards.get(broker.awaitingRestart.pop()).respawn();
    }
};