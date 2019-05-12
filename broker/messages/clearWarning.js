/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 06/05/2019
 * ╚════ ║   (ocelotbotv5) clearWarning
 *  ════╝
 */
module.exports = {
    name: "Clear Warning",
    id: "clearWarning",
    received: function received(broker, shard, warning){
        delete broker.warnings[warning.id];
    }
};