/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 06/05/2019
 * ╚════ ║   (ocelotbotv5) commandlist
 *  ════╝
 */
 module.exports = {
     name: "Broker Command List",
     id: "commandList",
     rebroadcast: false,
     returnData: false,
     received: function received(broker, shard, payload){
         if(broker.commandList)return;
         broker.logger.log("Got commandList");
         broker.commandList = payload;
     }
 };