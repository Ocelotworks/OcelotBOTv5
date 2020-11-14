const {parentPort} = require('worker_threads');

parentPort.on('message', (message)=>{
    let canvasPixels = message.canvasPixels;
    let size = message.size;
    let pixelData = new Uint8Array(size);
    let colorTableMap = new Map();
    let colorTableSize = 1;

    for (let i = 0; i < canvasPixels.length; i += 4) {
        let colorIndex;
        if (canvasPixels[i + 3] === 0) {	// Transparent
            colorIndex = 0;
        } else {
            let color = canvasPixels[i] + ',' + canvasPixels[i + 1] + ',' + canvasPixels[i + 2];
            if (colorTableMap.has(color)) { // Color exists in table
                colorIndex = colorTableMap.get(color);
            } else if (colorTableSize < 256) { // Color does not exist in table, but table is not full
                colorIndex = colorTableSize;
                colorTableMap.set(color, colorTableSize);
                ++colorTableSize;
            } else { // Color does not exist in table and the table is full
                colorIndex = findClosestInColorTable(
                    {
                        r: canvasPixels[i],
                        g: canvasPixels[i + 1],
                        b: canvasPixels[i + 2]
                    },
                    colorTableMap
                );
            }
        }
        pixelData[i / 4] = colorIndex;
    }

    parentPort.postMessage({pixelData, colorTableMap, colorTableSize});
})


let findClosestInColorTable = function(color, map) {
    let closestIndex = -1;
    let closestDistance = Infinity;

    for (let colorPair of map) {
        let mapColor = colorPair[0].split(',');
        let distance = Math.hypot(
            color.r - Number(mapColor[0]),
            color.g - Number(mapColor[1]),
            color.b - Number(mapColor[2])
        );
        if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = colorPair[1];
        }
    }
    return closestIndex;
};