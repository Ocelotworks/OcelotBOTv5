/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 06/05/2019
 * ╚════ ║   (ocelotbotv5) warning
 *  ════╝
 */
module.exports = {
    name: "Add Warning",
    id: "warning",
    received: function received(broker, shard, warning){
        broker.warnings[warning.id] = warning.message;
    }
};