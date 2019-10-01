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
        tracer          = require('dd-trace');


async function init(){
    tracer.init({
        analytics: true
    });

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
        const str = msg.content.toString();
        console.log("Processing new spook.");
        let spook = JSON.parse(msg.content);
        console.log(spook.spookerUsername+"->"+spook.spookedUsername);
        wss.clients.forEach(function(client){
            console.log(client.filter);
            if(!client.filter || client.filter === spook.server)
                client.send(str);
        });

        channel.ack(msg);
    });

    wss.on('connection', function(ws){
        console.log("Connection");
        ws.on('message', function(data){
            console.log(data);
            ws.filter = data;
        });
    });
}

init();
