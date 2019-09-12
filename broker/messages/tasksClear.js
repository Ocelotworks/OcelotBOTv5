/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 12/09/2019
 * ╚════ ║   (ocelotbotv5) taskClear
 *  ════╝
 */
module.exports = {
    name: "Task Management",
    id: "tasksClear",
    init: function init(broker){
        broker.freeShards = [];
    },
    received: function received(broker, shard, free){
        if(free){
            if(broker.freeShards.indexOf(shard.id) === -1)
                broker.freeShards.push(shard.id);
        }else{
            broker.freeShards.splice(broker.freeShards.indexOf(shard.id))
        }
    }
};