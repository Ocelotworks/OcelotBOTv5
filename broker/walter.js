/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 12/03/2019
 * ╚════ ║   (ocelotbotv5) vet
 *  ════╝
 */
const logger = require('ocelot-logger');
 module.exports = {
     name: "Walter",
     init: function init(manager, app){
        logger.log("Walter Initialising");


        let concerns = [{
            lastRestart: 0,
            restarts: 0,
            lastMessageCount: 0,
            badMessageCounts: 0,
            lastHeartbeat: 0,
        }];

        manager.on('message', function checkHeartbeat(process, message){
            if(message.type === "heartbeat"){
                const shard = message.payload.shard;
                if(message.payload.messagesPerMinute === 0){
                    logger.warn(`0 messages per minute for shard ${shard}`);
                    if(concerns[shard] && concerns[shard].badMessageCounts){
                        concerns[shard].badMessageCounts++;
                    }else{
                        concerns[shard] = {badMessageCounts: 1};
                    }

                    if(concerns[shard].badMessageCounts > 5){
                        logger.error(`Shard ${shard} has been without messages for 5 minutes, killing....`);
                        console.log(process);
                        //process.respawn(1000);
                    }
                }else{
                    concerns[shard] = {badMessageCounts: 0};
                }
            }
        });


     }
 };