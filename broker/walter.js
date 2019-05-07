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

            }
        });


     }
 };