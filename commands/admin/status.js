/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 17/04/2019
 * ╚════ ║   (ocelotbotv5) status
 *  ════╝
 */


const pm2 = require('pm2');
const ping = require('ping');


const statuses = {
    online: "<:green_tick_mark:542884088160190464>",
    stopping: "<:red_cross_mark:542884087996874752>",
    stopped: "<:red_cross_mark:542884087996874752>",
    launching: "<:yellow_minus_mark:542884088697192448>",
    errored: "‼"
};


const pings = {
    "Telemetry Server": "unacceptableuse.ddns.net",
    "Dashboard": "ocelot.xyz",
    "Trivia API": "opentdb.com",
    "AI API": "cleverbot.io",
    "Image Manipulation Server 1": "deepai.org"
};
module.exports = {
    name: "Status",
    usage: "status",
    commands: ["status"],
    run: async function(message, args, bot){
        pm2.connect(function(err){
            if(err){
                message.channel.send(`:warning: Couldn't connect to PM2: ${err}`);
                bot.raven.captureException(err);
                return;
            }
            pm2.list(async function(err, list){
                if(err){
                    message.channel.send(`:warning: Couldn't list PM2 processes: ${err}`);
                    bot.raven.captureException(err);
                    return;
                }


                let output = "SERVICE STATUS:\n";

                for(let i = 0; i < list.length; i++){
                    const process = list[i];
                    if(process.pm2_env && process.pm2_env.status)
                        output += statuses[process.pm2_env.status]+" ";

                    output += process.name;
                    output += "\n";
                }

                const keys = Object.keys(pings);
                for(let j = 0; j < keys.length; j++){
                    let alive = await ping.promise.probe(pings[keys[j]]);
                    output += alive ? "<:green_tick_mark:542884088160190464> " : "<:red_cross_mark:542884087996874752> ";
                    output += keys[j];
                    output += "\n";
                }

                message.channel.send(output);

            })
        })
    }
};