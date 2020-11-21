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
        fs              = require('fs'),
        twemoji         = require('twemoji-parser'),
        axios           = require('axios'),
        gif             = require('gifuct-js'),
        CanvasGifEncoder= require('../lib/canvas-gif-encoder'),
        canvas          = require('canvas');


let channel

function reply(msg, payload){
    channel.ack(msg);
    console.log("Replying "+msg.properties.replyTo);
    channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(payload)), {correlationId: msg.properties.correlationId});
}

async function init(){
    let con = await amqplib.connect(config.get("RabbitMQ.host"));
    channel = await con.createChannel();

    channel.assertQueue('imageFilter');
    channel.prefetch(5);

    channel.consume('imageFilter', function(msg){
        try {
            console.log("Processing " + msg.content.toString());
            let {url, format, filter, input} = JSON.parse(msg.content.toString());
            if(filter === "bigtext"){
                return doBigText(msg, url);
            }
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

async function doBigText(msg, term){
    const imageCache = {};

    const regularEmojis = twemoji.parse(term, {assetType: 'png'});
    const emojiMap = {};

    for (let i = 0; i < regularEmojis.length; i++) {
        const emoji = regularEmojis[i];
        emojiMap[emoji.indices[0]] = emoji;
    }

    const animElements = [];

    let textSize = 64;
    if(term.length <= 64){
        textSize = 128;
    }

    const cnv = canvas.createCanvas(2048, 1024);
    const ctx = cnv.getContext("2d");
    ctx.font = textSize + "px Arial";
    ctx.strokeStyle = "#202225";
    ctx.fillStyle = "#dcddde";

    let actualWidth = 0;
    let actualHeight = textSize;
    let currentWidth = 5;


    for (let i = 0; i < term.length; i++) {
        const char = term[i];
        if(char === "\n"){
            actualWidth = currentWidth;
            currentWidth = 5;
            actualHeight += textSize;
            continue;
        }
        const emojiHere = emojiMap[i];
        if (emojiHere) {
            const emojiImage = await cacheOrGet(imageCache, emojiHere.url);
            ctx.drawImage(emojiImage, currentWidth, actualHeight - (textSize - 2), textSize, textSize);
            currentWidth += textSize;
            i = emojiHere.indices[1] - 1;

        } else if (char === "<" && i < term.length - 1 && (term[i + 1] === ":" || (i < term.length - 2 && term[i + 1] === "a"))) {
            const isStatic = term[i + 1] === ":";
            const emojiStartIndex = isStatic ? i + 2 : i + 3;
            const emojiStart = term.substring(emojiStartIndex);
            const emojiEndIndex = emojiStart.indexOf(">");
            const idStart = emojiStart.substring(emojiStart.indexOf(":") + 1, emojiEndIndex);
            if (isStatic) {
                const emojiImage = await cacheOrGet(imageCache, `https://cdn.discordapp.com/emojis/${idStart}.png?v=1`);
                ctx.drawImage(emojiImage, currentWidth, actualHeight - (textSize - 2), textSize, textSize);
            } else {
                const response = await axios.get(`https://cdn.discordapp.com/emojis/${idStart}.gif?v=1`, {responseType: "arraybuffer"});
                const parsedGif = await gif.parseGIF(response.data);
                const gifFrames = await gif.decompressFrames(parsedGif, true);
                animElements.push({x: currentWidth, y: actualHeight - (textSize - 2), frames: gifFrames});
            }
            currentWidth += textSize;
            i = emojiStartIndex + emojiEndIndex;

        } else {
            ctx.fillText(char, currentWidth, actualHeight);
            ctx.strokeText(char, currentWidth, actualHeight);
            currentWidth += ctx.measureText(char).width;
        }
        if (currentWidth >= (1024 - textSize)) {
            actualWidth = currentWidth;
            currentWidth = textSize / 2;
            actualHeight += textSize;
        } else if (actualWidth < currentWidth) {
            actualWidth = currentWidth;
        }
    }
    actualWidth += 5;
    actualHeight += 10;


    if (animElements.length > 0) {
        const encoder = new CanvasGifEncoder(actualWidth, actualHeight);

        let frameCount = 0;
        for (let i = 0; i < animElements.length; i++) {
            if (animElements[i].frames.length > frameCount) {
                frameCount = animElements[i].frames.length;
                if(frameCount > 100){
                    frameCount = 100;
                    break;
                }
            }
        }

        console.log("Frame count is ", frameCount);

        let frameTimeTotal = 0;
        encoder.begin();
        const newCanvas = canvas.createCanvas(actualWidth, actualHeight);
        const newCtx = newCanvas.getContext("2d");
        newCtx.imageSmoothingEnabled = false;
        newCtx.imageSmoothingQuality = "low";
        newCtx.antialias = "none";
        newCtx.patternQuality = "nearest";
        newCtx.quality = "nearest";
        let finishedFrames = 0;
        for (let f = 0; f < frameCount; f++) {
            newCtx.clearRect(0, 0, actualWidth, actualHeight);
            newCtx.drawImage(cnv, 0, 0);
            let delayTotal = 0;
            for (let i = 0; i < animElements.length; i++) {
                let element = animElements[i];
                const frame = element.frames[f % element.frames.length];
                delayTotal += frame.delay;
                const imageCanvas = canvas.createCanvas(frame.dims.width, frame.dims.height);
                const imageCtx = imageCanvas.getContext("2d");
                let frameData = imageCtx.createImageData(frame.dims.width, frame.dims.height);
                frameData.data.set(frame.patch);
                imageCtx.putImageData(frameData, frame.dims.left, frame.dims.top);
                const scaleRatio = textSize/imageCanvas.width;
                newCtx.drawImage(imageCanvas, element.x, element.y, textSize, imageCanvas.height*scaleRatio);
            }
            let frameStart = new Date().getTime();
            encoder.addFrame(newCtx, Math.round(delayTotal/animElements.length), f).then(()=>{
                finishedFrames++;
                frameTimeTotal = (new Date().getTime()-frameStart);
                console.log(`Finished frame ${f}, ${finishedFrames} total finished.`);
                if(finishedFrames >= frameCount){
                    console.log("All frames done");
                    reply(msg, {image: encoder.end().toString("base64"), performance: {frameCount, frameTimeTotal}})
                }
            })
        }
    } else {
        const newCanvas = canvas.createCanvas(actualWidth, actualHeight);
        const newCtx = newCanvas.getContext("2d");
        newCtx.drawImage(cnv, 0, 0);
        reply(msg, {image: newCanvas.toBuffer("image/png").toString("base64")})
    }
}

async function cacheOrGet(cache, url){
    if(cache[url])
        return cache[url];
    let result = await canvas.loadImage(url);
    cache[url] = result;
    return result;
}