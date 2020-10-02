/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 09/10/2019
 * ╚════ ║   (ocelotbotv5) livecount
 *  ════╝
 */
process.env["NODE_CONFIG_DIR"] = "../config";
const   config          = require('config'),
        amqplib         = require('amqplib'),
        https           = require('https'),
        fs              = require('fs'),
        ws              = require('ws'),
        knex            = require('knex')(config.get("Database")),
        elasticApm      = require('elastic-apm-node');

let  count = 0;

async function init(){
    let apm;
    if(config.get("APM")){
        apm = elasticApm.start({
            serviceName: "OcelotBOT-Livecount",
            secretToken: config.get("APM.Token"),
            serverUrl: config.get("APM.Server")
        })
    }

    const server = https.createServer({
        key: fs.readFileSync('/home/peter/privkey.pem'),
        cert: fs.readFileSync('/home/peter/cert.pem')
    });
    const wss = new ws.Server({server});

    server.listen(8235);
    let con = await amqplib.connect(config.get("RabbitMQ.productionHost"));
    //let channel = await con.createChannel();
    async function createSub(name, callback){
        let channel = await con.createChannel();
        channel.assertExchange(name, 'fanout', {durable: false});
        let q = await channel.assertQueue(`ps-livecount-${name}`, {exclusive: true});
        channel.bindQueue(q.queue, name, '');
        channel.consume(q.queue, callback, {noAck: true});
    }

    count = (await knex.select(knex.raw("MAX(id)")).from("commandlog"))[0]['MAX(id)'];

    createSub("commandPerformed", function(msg){
        count++;
        wss.clients.forEach(function(client){
            client.send(count);
        });
    });

    wss.on('connection', function(ws){
        console.log("Received Connection");
        ws.send(count);
        ws.on('close', function(){
            console.log("Connection closed");
        });
    });
}

init();