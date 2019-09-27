/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 06/09/2019
 * ╚════ ║   (ocelotbotv5) image
 *  ════╝
 */
process.env["NODE_CONFIG_DIR"] = "../config";
const   config          = require('config'),
        amqplib         = require('amqplib'),
        gm              = require('gm'),
        request         = require('paranoid-request'),
        fs              = require('fs'),
        tracer          = require('dd-trace');


async function init(){
    tracer.init({
        analytics: true
    });
    let con = await amqplib.connect(config.get("RabbitMQ.host"));
    let channel = await con.createChannel();


    function reply(msg, payload){
        channel.ack(msg);
        console.log("Replying "+msg.properties.replyTo);
        channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(payload)), {correlationId: msg.properties.correlationId});
    }

    channel.assertQueue('imageFilter');
    channel.prefetch(5);

    channel.consume('imageFilter', function(msg){
        console.log("Processing "+msg.content.toString());
        let {url, format, filter, input} = JSON.parse(msg.content.toString());
        let fileName = `${__dirname}/../temp/${Math.random()}.png`;
        let shouldProcess = true;
            request({uri: url, timeout: 10000})
                .on("response", function requestResponse(resp) {
                    console.log("Downloading Image");
                    shouldProcess = !(resp.headers && resp.headers['content-type'] && resp.headers['content-type'].indexOf("image") === -1);
                    if (format !== "JPEG" && resp.headers && resp.headers['content-type'] && resp.headers['content-type'].toLowerCase() === "image/gif")
                        format = "GIF";

                })
                .on("error", function requestError() {
                    shouldProcess = false;
                })
                .on("end", function requestEnd() {
                    if (!shouldProcess) {
                        fs.unlink(fileName, function unlinkInvalidFile(err) {
                            if (err)
                                reply(msg, {err: "Error unlinking invalid file"});
                            else
                                reply(msg, {err: "Not a valid image type"});
                        });
                        return;
                    }
                    try {
                        const initialProcess = gm(fileName).autoOrient();
                        initialProcess[filter].apply(initialProcess, input)
                            .toBuffer(format, function toBuffer(err, buffer) {
                                if (err) {
                                    console.log(err);
                                    return reply(msg, {err: "Error creating buffer"});
                                }
                                let name = filter + "." + (format.toLowerCase());
                                if (url.indexOf("SPOILER_") > -1)
                                    name = "SPOILER_" + name;
                                console.log("Done");
                                reply(msg, {image: buffer.toString('base64'), name});
                                fs.unlink(fileName, function unlinkCompletedFile(err) {
                                    if (err)
                                        console.warn(err);
                                });
                            });
                    }catch(e){
                        console.error(e);
                        reply(msg, {err: e});
                    }
                }).pipe(fs.createWriteStream(fileName));
    });

}

init();

