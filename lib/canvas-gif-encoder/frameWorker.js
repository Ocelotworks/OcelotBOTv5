const {parentPort} = require('worker_threads');

parentPort.on('message', (message)=>{
    let canvasPixels = message.canvasPixels;
    let size = message.size;
    let pixelData = new Uint8Array(size);
    let colorTableMap = new Map();
    let colorTableSize = 1;
    let colorCache = {};

    for (let i = 0; i < canvasPixels.length; i += 4) {
        let colorIndex;
        if (canvasPixels[i + 3] === 0) {	// Transparent
            colorIndex = 0;
        } else {
            const color = `${canvasPixels[i]},${canvasPixels[i+1]},${canvasPixels[i+2]}`;
            if (colorTableMap.has(color)) { // Color exists in table
                colorIndex = colorTableMap.get(color);
            } else {
                const cache = colorCache[color];
                if(cache){
                    colorIndex = cache;
                }else{
                    colorIndex = findClosestInColorTable(
                        {r: canvasPixels[i], g: canvasPixels[i + 1], b: canvasPixels[i + 2]},
                        colorTableMap, colorTableSize < 256);
                    if(colorIndex) {
                        colorCache[color] = colorIndex;
                    }else{
                        colorIndex = colorTableSize;
                        colorTableMap.set(color, colorTableSize);
                        ++colorTableSize;
                    }
                }
            }
        }
        pixelData[i / 4] = colorIndex;
    }

    parentPort.postMessage({pixelData, colorTableMap, colorTableSize});
})


let findClosestInColorTable = function(color, map, optional) {
    let closestIndex = -1;
    let closestDistance = Infinity;
    for (let colorPair of map) {
        let mapColor = colorPair[0].split(',');
        let distance =
            Math.pow(color.r - Number(mapColor[0]), 2) +
            Math.pow(color.g - Number(mapColor[1]), 2) +
            Math.pow(color.b - Number(mapColor[2]), 2);
        if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = colorPair[1];
            if(closestDistance < 3)break;
        }
    }
    if(optional && closestDistance >= 3)
        return null;
    return closestIndex;
};