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
        broker.shardTasks = [];


        broker.manager.on("launch", function launchShard(shard){
            broker.logger.log(`Clearing tasks for shard ${shard.id}`);
            broker.shardTasks[shard.id] = 0;
        })
    },
    received: function received(broker, shard, free){
        if(!free){
            if(broker.shardTasks[shard.id])
                broker.shardTasks[shard.id]++;
            else
                broker.shardTasks[shard.id] = 1;
        }else{
            if(broker.shardTasks[shard.id])
                broker.shardTasks[shard.id]--;
            else
                broker.shardTasks[shard.id] = 0;

            if(broker.shardTasks[shard.id] === 0 && broker.awaitingRestart.indexOf(shard.id) > -1){
                broker.logger.warn("Shard "+shard.id+" was awaiting restart and is now free.");
                broker.awaitingRestart.splice(broker.awaitingRestart.indexOf(shard.id));
                shard.send({"type": "destruct"});
                setTimeout(function(){
                    shard.respawn();
                }, 2000);
            }
        }
        console.log(broker.shardTasks);
        console.log(free);
    }
};