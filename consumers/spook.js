/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 22/09/2019
 * ╚════ ║   (ocelotbotv5) spook
 *  ════╝
 */
process.env["NODE_CONFIG_DIR"] = "../config";
const   config          = require('config'),
        amqplib         = require('amqplib'),
        https           = require('https'),
        fs              = require('fs'),
        ws              = require('ws'),
        elasticApm      = require('elastic-apm-node');


async function init(){

    let apm;
    if(config.get("APM")){
        apm = elasticApm.start({
            serviceName: "OcelotBOT-Spook",
            secretToken: config.get("APM.Token"),
            serverUrl: config.get("APM.Server")
        })
    }

    const server = https.createServer({
        key: fs.readFileSync('/home/peter/privkey.pem'),
        cert: fs.readFileSync('/home/peter/cert.pem')
    });
    const wss = new ws.Server({server});

    server.listen(8234);
    let con = await amqplib.connect(config.get("RabbitMQ.host"));
    let channel = await con.createChannel();

    channel.assertQueue('spook');

    channel.consume('spook', function(msg){
        let tx = apm.startTransaction("Update Spook Clients")
        let span = tx.startSpan("Parse Message");
        const str = msg.content.toString();
        console.log("Processing new spook.");
        let spook = JSON.parse(msg.content);
        span.end();
        console.log(spook.spookerUsername+" -> "+spook.spookedUsername);
        console.log("Got "+wss.clients.size+" clients.");
        span = tx.startSpan("Send to clients");
        wss.clients.forEach(function(client){
            if(!client.filter || client.filter === spook.server) {
                console.log("Sending to client with filter "+client.filter);
                client.send(str);
            }
        });
        span.end();

        span = tx.startSpan("Ack message");
        channel.ack(msg);
        span.end();
        tx.end();
    });

    wss.on('connection', function(ws){
        console.log("Received Connection");
        ws.on('message', function(data){
            console.log("Filter set to "+data);
            ws.filter = data;
        });

        ws.on('close', function(){
            console.log("Connection closed");
        });
    });
}

init();
