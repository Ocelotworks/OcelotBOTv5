/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 06/05/2019
 * ╚════ ║   (ocelotbotv5) ipc
 *  ════╝
 */
const fs = require('fs');
const Sentry = require('@sentry/node');
module.exports = {
    name: "IPC",
    init: function init(broker) {

      broker.ipc = {};

      broker.ipc.callbackID = 0;
      broker.ipc.waitingCallbacks = {};



      broker.ipc.messages = {};


      broker.logger.log("Loading IPC messages...");
        fs.readdir("messages", async function readMessagesDir(err, files) {
            if (err) {
                console.error(err);
                return;
            }

            for(let i = 0; i < files.length; i++){
                try {
                    let message = require(`${__dirname}/../messages/${files[i]}`);

                    if(message.init) {
                       broker.logger.log(`Performing init for ${message.name}`);
                       message.init(broker);
                    }

                    broker.logger.log(`Loading Message ${message.name} (${message.id})`);

                    broker.ipc.messages[message.id] = message;

                }catch(e){
                    Sentry.captureException(e);
                    broker.logger.error(`Failed to load ${files[i]}`);
                    console.error(e);
                }
            }
        });


      broker.ipc.requestData = function requestData(name, callback, additionalData){
          let id = broker.ipc.callbackID++;
          broker.ipc.waitingCallbacks[id] = callback;
          broker.manager.broadcast({
              type: "requestData",
              payload: {
                  name: name,
                  callbackID: id,
                  data: additionalData
              }
          })
      };


      broker.manager.on("shardCreate", function onShardCreate(shard){
            shard.on("message", function onMessage(message){
                try {
                    if (message.type && broker.ipc.messages[message.type]) {
                        if (broker.ipc.messages[message.type].received)
                            broker.ipc.messages[message.type].received(broker, 0, message.payload);
                        if (broker.ipc.messages[message.type].rebroadcast)
                            broker.manager.broadcast(message);
                    } else if (message["_fetchProp"]) { //discord.js shit
                        return
                    } else if (message["_eval"]) {
                        return
                    } else {
                        broker.logger.warn(`Unknown message type ${message.type ? message.type : JSON.stringify(message)}!`);
                    }

                    if (message.payload && message.payload.callbackID && broker.ipc.waitingCallbacks[message.payload.callbackID]) {
                        broker.ipc.waitingCallbacks[message.payload.callbackID](message.payload.data);
                        delete broker.ipc.waitingCallbacks[message.payload.callbackID];
                    }
                }catch(e){
                    console.error(e);
                }
            });
      })




    }
};