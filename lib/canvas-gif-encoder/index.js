'use strict';


const WorkerPool = require('./workerPool');
const compress = require('./lzw.js');
const os = require('os');
class CanvasGifEncoder {
	constructor(width, height, options = {}) {
		if (typeof width !== 'number' || width <= 0 || width >= 65536) {
			throw 'The GIF width needs to be a number between 1 and 65535';
		}
		if (typeof height !== 'number' || height <= 0 || height >= 65536) {
			throw 'The GIF height needs to be a number between 1 and 65535';
		}

		this.width = Math.trunc(width);
		this.height = Math.trunc(height);

		this.workerPool = new WorkerPool(os.cpus().length);

		this.output = [];

	}

	appendData(data){
		this.output.push(Buffer.from(data, 'binary'))
	}

	begin() {
		let header = Uint8Array.of(
			0x47, 0x49, 0x46, 0x38, 0x39, 0x61,                               // GIF89a
			this.width & 0xFF, (this.width >> 8) & 0xFF,                      // Logical screen width in pixels (little-endian)
			this.height & 0xFF, (this.height >> 8) & 0xFF,                    // Logical screen height in pixels (little-endian)
			0x70,	                                                            // Depth = 8 bits, no global color table
			0x00,                                                             // Transparent color: 0
			0x00,                                                             // Default pixel aspect ratio
			0x21, 0xFF, 0x0B,                                                 // Application Extension block (11 bytes for app name and code)
			0x4E, 0x45, 0x54, 0x53, 0x43, 0x41, 0x50, 0x45, 0x32, 0x2E, 0x30, // NETSCAPE2.0
			0x03,                                                             // 3 bytes of data
			0x01,	                                                            // Sub-block index
			0x00, 0x00,                                                       // Repeat inifinitely
			0x00                                                              // End of block
		);

		this.appendData(header);
	}

	async addFrame(context, delay, frameNumber) {
		return new Promise((fulfill)=>{
			if (typeof delay !== 'number') {
				throw 'The delay length needs to be a number';
			}
			delay = Math.round(delay / 10); // Argument is in milliseconds, GIF uses centiseconds
			if (delay < 0 || delay >= 65536) {
				throw 'The delay length needs to be between 0 and 655350 milliseconds';
			}

			let graphicControlExtension = Uint8Array.of(
				0x21, 0xF9, 0x04,                  // Graphic Control Extension (4 bytes)
				0x09,                              // Restore to BG color, do not expect user input, transparent index exists
				delay & 0xFF, (delay >> 8) & 0xFF, // Delay in centiseconds (little-endian)
				0x00,                              // Color 0 is transparent
				0x00                               // End of block
			);


			let canvasPixels = context.getImageData(0, 0, this.width, this.height);

			this.workerPool.runTask({canvasPixels: canvasPixels.data, size: canvasPixels.width * canvasPixels.height}, (err, {pixelData, colorTableMap, colorTableSize})=>{
				let colorTableBits = Math.max(2, Math.ceil(Math.log2(colorTableSize)));

				let colorTableData = new Uint8Array((1 << colorTableBits) * 3);
				for (let colorPair of colorTableMap) {
					let rgb = colorPair[0].split(',');

					colorTableData[colorPair[1] * 3    ] = Number(rgb[0]);
					colorTableData[colorPair[1] * 3 + 1] = Number(rgb[1]);
					colorTableData[colorPair[1] * 3 + 2] = Number(rgb[2]);
				}
				let imageDescriptor = Uint8Array.of(
					0x2C,                                          // Image descriptor
					0x00, 0x00,                                    // Left X coordinate of image in pixels (little-endian)
					0x00, 0x00,                                    // Top Y coordinate of image in pixels (little-endian)
					this.width & 0xFF, (this.width >> 8) & 0xFF,   // Image width in pixels (little-endian)
					this.height & 0xFF, (this.height >> 8) & 0xFF, // Image height in pixels (little-endian)
					0x80 | (colorTableBits - 1) & 0x07             // Use a local color table, do not interlace, table is not sorted, the table indices are colorTableBits bits long
				);

				let compressedPixelData = compress(colorTableBits, pixelData);
				const arrayIndex = frameNumber*5;
				this.output[arrayIndex+1] = Buffer.from(graphicControlExtension, 'binary');
				this.output[arrayIndex+2] = Buffer.from(imageDescriptor, 'binary');
				this.output[arrayIndex+3] = Buffer.from(colorTableData, 'binary');
				this.output[arrayIndex+4] = Buffer.from(Uint8Array.of(colorTableBits), 'binary');
				this.output[arrayIndex+5] = Buffer.from(compressedPixelData, 'binary');
				fulfill();
			})

		});
	}

	end() {
		this.workerPool.close();
		this.appendData(Uint8Array.of(0x3B));
		// this.appendData(null);
		return Buffer.concat(this.output);
	}
}

module.exports = CanvasGifEncoder;
