const canvas = require('canvas');
const twemoji = require('twemoji-parser');
const Discord = require('discord.js');
const axios = require('axios');
const gif = require('gifuct-js');
const CanvasGifEncoder = require('../lib/canvas-gif-encoder');
module.exports = {
    name: "Big Text Generator",
    usage: "bigtext <text>",
    categories: ["text"],
    requiredPermissions: ["EMBED_LINKS", "ATTACH_FILES"],
    commands: ["bigtext", "big"],
    run:  async function(message, args, bot) {
        try {
            if (!args[1]) {
                message.replyLang("GENERIC_TEXT", {command: args[0]});
                return;
            }

            const imageCache = {};
            const term = args.slice(1).join(" ");

            const regularEmojis = twemoji.parse(term, {assetType: 'png'});
            const emojiMap = {};

            for (let i = 0; i < regularEmojis.length; i++) {
                const emoji = regularEmojis[i];
                emojiMap[emoji.indices[0]] = emoji;
            }

            const animElements = [];

            const textSize = 64;

            const cnv = canvas.createCanvas(1024, 1024);
            const ctx = cnv.getContext("2d");
            ctx.font = textSize + "px Arial";
            ctx.strokeStyle = "#202225";
            ctx.fillStyle = "#dcddde";

            let actualWidth = 0;
            let actualHeight = textSize;
            let currentWidth = textSize / 2;


            for (let i = 0; i < term.length; i++) {
                const char = term[i];
                if(char === "\n"){
                    actualWidth = currentWidth;
                    currentWidth = textSize / 2;
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
            actualWidth += textSize / 2;
            actualHeight += textSize / 2;


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
                let finishedFrames = 0;
                for (let f = 0; f < frameCount; f++) {
                    console.log("Drawing frame ", f);
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
                        newCtx.drawImage(imageCanvas, element.x, element.y, textSize, textSize);
                    }
                    let frameStart = new Date().getTime();
                    encoder.addFrame(newCtx, Math.round(delayTotal/animElements.length), f).then(()=>{
                        finishedFrames++;
                        frameTimeTotal = (new Date().getTime()-frameStart);
                        console.log(`Finished frame ${f}, ${finishedFrames} total finished.`);
                        if(finishedFrames >= frameCount){
                            console.log("All frames done");
                            message.channel.send(message.author.id === "139871249567318017" ?
                                `Frames: ${frameCount}. Total Frame Time: ${frameTimeTotal}ms. Per Frame: ${(frameTimeTotal/frameCount).toFixed(2)}ms/frame` : "",
                                new Discord.MessageAttachment(encoder.end(), "bigtext.gif"));
                        }
                    })
                }
            } else {
                const newCanvas = canvas.createCanvas(actualWidth, actualHeight);
                const newCtx = newCanvas.getContext("2d");
                newCtx.drawImage(cnv, 0, 0);
                message.channel.send("", new Discord.MessageAttachment(newCanvas.toBuffer("image/png"), "bigtext.png"));
            }
        }catch(e){
            console.log(e);
        }
    }
};

async function cacheOrGet(cache, url){
    if(cache[url])
        return cache[url];
    let result = await canvas.loadImage(url);
    cache[url] = result;
    return result;
}