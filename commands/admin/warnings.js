/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 06/05/2019
 * ╚════ ║   (ocelotbotv5) warnings
 *  ════╝
 */
const request = require('request');
const config = require('config');
module.exports = {
    name: "Warnings",
    usage: "warnings",
    commands: ["warnings"],
    run: async function(message, args, bot){
       request(`http://${config.get("General.BrokerHost")}:${config.get("General.BrokerPort")}/warnings`, function(err, resp, body){
          if(err)
              return message.channel.send("Error: "+err);
          try{

              let warnings = JSON.parse(body);
              if(Object.keys(warnings).length === 0)
                  return message.channel.send(":white_check_mark: No Warnings!");

              let output = ":warning: **Warnings:**\n";
              for(let warningID in warnings){
                  if(!warnings.hasOwnProperty(warningID))continue;
                  output += `(${warningID}) ${warnings[warningID]}\n`;
              }

              message.channel.send(output);


          }catch(e){
              bot.raven.captureException(e);
              message.channel.send("Error parsing broker response: "+e);
          }
       });
    }
};