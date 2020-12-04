/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 06/09/2019
 * ╚════ ║   (ocelotbotv5) analytics.js
 *  ════╝
 */
process.env["NODE_CONFIG_DIR"] = "../config";
const   config          = require('config'),
        amqplib         = require('amqplib'),
        MatomoTracker   = require('matomo-tracker'),
        elasticApm      = require('elastic-apm-node');

const   matomo      = new MatomoTracker(config.get("Matomo.SiteID"), config.get("Matomo.URL"));

async function init(){
    let apm;
    if(config.get("APM")){
        // apm = elasticApm.start({
        //     serviceName: "OcelotBOT-Analytics",
        //     secretToken: config.get("APM.Token"),
        //     serverUrl: config.get("APM.Server")
        // })
    }

    let con = await amqplib.connect(config.get("RabbitMQ.host"));
    //let channel = await con.createChannel();

    let userCache = [];

    async function createSub(name, callback){
        let channel = await con.createChannel();
        channel.assertExchange(name, 'fanout', {durable: false});
        let q = await channel.assertQueue(`ps-analytics-${name}`);
        channel.bindQueue(q.queue, name, '');
        channel.consume(q.queue, callback, {noAck: true});
    }

    createSub("commandPerformed", function(msg){
        //let tx = apm.startTransaction("Track Command Performed");
        //let span = tx.startSpan("Parse Message");
        const shard = msg.properties.appId.split("-")[1];
        const {message, command} = JSON.parse(msg.content.toString());
       // span.end();
       // span = tx.startSpan("Matomo Track");
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
        //span.end();
        //span = tx.startSpan("Cache User ID");
        userCache.push(message.author.id);
       // span.end();
        //tx.end();
    });

    createSub("commandRatelimited", function(msg){
       // let tx = apm.startTransaction("Track Command Performed");
      // let span = tx.startSpan("Parse Message");
        const shard = msg.properties.appId.split("-")[1];
        const {message, command} = JSON.parse(msg.content.toString());
       // span.end();
       // span = tx.startSpan("Matomo Track");
        matomo.track({
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
       // span.end();
        //tx.end();
    });

    setInterval(function(){
        userCache = [];
    }, 86400000 );
}

init();