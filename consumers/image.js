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
        request         = require('@naturalatlas/paranoid-request'),
        fs              = require('fs');
        //tracer          = require('dd-trace');


async function init(){
    //tracer.init({
    //    analytics: true
    //});
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
        try {
            console.log("Processing " + msg.content.toString());
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
                .on("error", function requestError(err) {
                    shouldProcess = false;
                    console.log(err);
                    reply(msg, {err: "Error loading file"});
                })
                .on("end", function requestEnd() {
                    if (!shouldProcess) {
                        fs.unlink(fileName, function unlinkInvalidFile(err) {
                            if (err)
                                console.log(err);
                        });
                        return;
                    }
                    try {
                        const initialProcess = gm(fileName).autoOrient();
                        let filteredImage = initialProcess[filter].apply(initialProcess, input);

                        filteredImage.filesize((err, value)=>{
                            if(!err && value && value.endsWith("Mi") && parseInt(value) > 4){
                                console.log("Resizing image");
                                filteredImage = filteredImage.resize("50%");
                            }
                            console.log(err, value);
                        });

                        filteredImage.toBuffer(format, function toBuffer(err, buffer) {
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
                    } catch (e) {
                        console.error(e);
                        reply(msg, {err: e});
                    }
                }).pipe(fs.createWriteStream(fileName));
        }catch(e){
            console.error(e);
            reply(msg, {err: e});
        }
    });

}

init();

