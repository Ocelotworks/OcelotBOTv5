/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 06/05/2019
 * ╚════ ║   (ocelotbotv5) heartbeat
 *  ════╝
 */

module.exports = {
    name: "Heartbeat",
    id: "heartbeat",
    init: function(broker){
        broker.concerns = [{
            lastRestart: 0,
            restarts: 0,
            lastMessageCount: 0,
            badMessageCounts: 0,
            lastHeartbeat: 0,
        }];
    },
    received: function received(broker, process, payload){
        const shard = payload.shard;
        if(payload.messagesPerMinute === 0){
            broker.logger.warn(`0 messages per minute for shard ${shard}`);
            if(broker.concerns[shard] && broker.concerns[shard].badMessageCounts){
                broker.concerns[shard].badMessageCounts++;
            }else{
                broker.concerns[shard] = {badMessageCounts: 1};
            }

            if(broker.concerns[shard].badMessageCounts > 5){
                broker.logger.error(`Shard ${shard} has been without messages for 5 minutes, killing....`);
                console.log(process);
                try {
                    process.respawn();
                }catch(e)
                {
                    broker.logger.error("no... thats not right");
                }
            }
        }else{
            broker.concerns[shard] = {badMessageCounts: 0};
        }
    }
};
