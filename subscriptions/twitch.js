/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 01/03/2019
 * ╚════ ║   (ocelotbotv5) twitch
 *  ════╝
 */

const Discord = require('discord.js');
const config = require('config');
const request = require('request');
const client = config.get("Commands.twitch.clientID");
module.exports = {
    name: "Twitch",
    id: "twitch",
    alias: ["twitch.tv"],
    hidden: true,
    validate: function(input){
    },
    check: async function check(sub, lastCheck){

    },
    added: function added(sub){
        console.log("Getting for sub ");
        request.get({
            url: `https://api.twitch.tv/helix/users?login=${encodeURIComponent(sub.data)}`,
            headers: {
                "Client-ID": client
            },
            json: true
        }, function(err, res, body){
            if(!err && body[0] && body[0].id){
                let id = body[0].id;

            request.post({
                url: `https://apoi.twitch.tv/helix/webhooks/hub`,
                headers: {
                    "Client-ID": client
                },
                body: {
                    "hub.mode": "subscribe",
                    "hub.topic": `https://api.twitch.tv/helix/streams/?user_id=${id}`,
                    "hub.lease_seconds": "86400000",
                    "hub.callback": "https://ocelot.xyz/dash/twitchCallback.php",
                    "hub.secret": `SUBID:${sub.id}`
                },
                json: true
            }, function(err, res, body){
                console.log(body);
            });
            }else{
                console.log(body);
                console.error(err);
            }
        });

    }
};
