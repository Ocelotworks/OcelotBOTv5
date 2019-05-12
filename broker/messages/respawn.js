/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 10/05/2019
 * ╚════ ║   (ocelotbotv5) reload
 *  ════╝
 */
module.exports = {
    name: "Respawn All",
    id: "respawn",
    received: function received(broker, process, payload){
        broker.logger.warn("Respawning all shards.");
        broker.manager.respawnAll();
    }
};