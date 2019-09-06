/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 06/09/2019
 * ╚════ ║   (ocelotbotv5) analytics.js
 *  ════╝
 */
process.env["NODE_CONFIG_DIR"] = "../config";
const   config          = require('config'),
        amqplib         = require('amqplib'),
        StatsD          = require('node-dogstatsd').StatsD,
        MatomoTracker   = require('matomo-tracker');

const   matomo      = new MatomoTracker(config.get("Matomo.SiteID"), config.get("Matomo.URL")),
        dogstatsd   = new StatsD();



async function init(){
    let con = await amqplib.connect(config.get("RabbitMQ.host"));
    //let channel = await con.createChannel();

    let userCache = [];

    async function createSub(name, callback){
        let channel = await con.createChannel();
        channel.assertExchange(name, 'fanout', {durable: false});
        let q = await channel.assertQueue('', {exclusive: true});
        channel.bindQueue(q.queue, name, '');
        channel.consume(q.queue, callback, {no_ack: true});
    }

    createSub("commandPerformed", function(msg){
        const shard = msg.properties.appId.split("-")[1];
        const {message, command} = JSON.parse(msg.content.toString());
        console.log(message, command);
        matomo.track({
            action_name: "Command Performed",
            uid: message.author.id,
            url: `http://bot.ocelot.xyz/${command}`,
            ua: message.guild ? message.guild.name : "DM Channel",
            new_visit: userCache.indexOf(message.author.id) === -1,
            e_c: "Command",
            e_a: "Performed",
            e_n: command,
            e_v: 1,
            cvar: JSON.stringify({
                1: ['Server ID', message.guild ? message.guild.id : "0"],
                2: ['Server Name', message.guild ? message.guild.name : "DM Channel"],
                3: ['Message', message.cleanContent],
                4: ['Channel Name', message.channel.name],
                5: ['Channel ID', message.channel.id]
            })
        });
        userCache.push(message.author.id);
    });

    createSub("commandRatelimited", function(msg){
        const shard = msg.properties.appId.split("-")[1];
        const {message, command} = JSON.parse(msg.content.toString());
        console.log(message, command);
        bot.matomo.track({
            action_name: "Command Rate Limited",
            uid: message.author.id,
            url: `http://bot.ocelot.xyz/${command}`,
            ua:  message.guild ? message.guild.name : "DM Channel",
            e_c: "Command",
            e_a: "Rate Limited",
            e_n: command,
            e_v: 1,
            cvar: JSON.stringify({
                1: ['Server ID', message.guild ? message.guild.id : "0"],
                2: ['Server Name', message.guild ? message.guild.name : "DM Channel"],
                3: ['Message', message.cleanContent],
                4: ['Channel Name', message.channel.name],
                5: ['Channel ID', message.channel.id]
            })
        });
    });

    setInterval(function(){
        userCache = [];
    }, 86400000 );
}

init();