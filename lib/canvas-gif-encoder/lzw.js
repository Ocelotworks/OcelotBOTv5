'use strict';

const MAX_CODE_LENGTH = 12;
const PACKER_BITS_PER_ELEMENT = 8;
const PACKER_BLOCK_SIZE_LIMIT = 1 << PACKER_BITS_PER_ELEMENT;

class CodePacker {
	constructor() {
		this.result = [];
		this._blockBuffer = [];
		this._bitBuffer = [];
	}

	write(code, codeSize) {
		for (let bit = 0; bit < codeSize; ++bit) {
			this._bitBuffer.push((code >> bit) & 1);
		}

		if (this._blockBuffer.length + Math.ceil(this._bitBuffer.length / PACKER_BITS_PER_ELEMENT) >= PACKER_BLOCK_SIZE_LIMIT) {
			this._flushBlock();
		}

		this._pushBits();
	}

	_pushBits() {
		while (this._bitBuffer.length >= PACKER_BITS_PER_ELEMENT) {
			let byteValue = 0;
			for (let bit = 0; bit < PACKER_BITS_PER_ELEMENT; ++bit) {
				byteValue |= (this._bitBuffer.shift() & 1) << bit;
			}
			this._blockBuffer.push(byteValue);
		}
	}
	_flushBits() {
		this._pushBits();

		if (this._bitBuffer.length !== 0) {
			let byteValue = 0;
			for (let bit = 0; bit < this._bitBuffer.length; ++bit) {
				byteValue |= (this._bitBuffer.shift() & 1) << bit;
			}
			this._blockBuffer.push(byteValue);
			this._bitBuffer = [];
		}
	}

	_flushBlock() {
		if (this._blockBuffer.length !== 0) {
			this.result.push(this._blockBuffer.length);
			this.result = this.result.concat(this._blockBuffer);
			this._blockBuffer = [];
		}
	}

	flush() {
		this._flushBits();
		this._flushBlock();
	}
}

let encode = function(minCodeSize, data) {
	if (!(data instanceof Uint8Array)) {
		throw 'Data needs to be a Uint8Array';
	}

	if (
		typeof minCodeSize !== 'number' ||
		minCodeSize <= 0 ||
		Math.trunc(minCodeSize) !== minCodeSize
	) {
		throw 'The minimum code size needs to be a positive integer';
	}

	const CLEAR_CODE = 1 << minCodeSize;
	const END_CODE = CLEAR_CODE + 1;

	let output = [];

	let packer = new CodePacker();
	let dictionary = new Map();
	let dictionarySize = END_CODE + 1;
	let phrase = '';

	let codeLength = Math.ceil(Math.log2(dictionarySize));

	packer.write(CLEAR_CODE, codeLength);

	for (let byte of data) {
		let char = String.fromCharCode(byte);
		let newPhrase = phrase + char;

		if (newPhrase.length === 1 || dictionary.has(newPhrase)) {
			phrase = newPhrase;
		} else {
			if (phrase.length > 1) {
				packer.write(dictionary.get(phrase), codeLength);
			} else {
				packer.write(phrase.charCodeAt(0), codeLength);
			}
			dictionary.set(newPhrase, dictionarySize);
			++dictionarySize;
			codeLength = Math.ceil(Math.log2(dictionarySize));

			if (dictionarySize >= (1 << MAX_CODE_LENGTH)) {
				packer.write(CLEAR_CODE, codeLength);
				dictionary = new Map();
				dictionarySize = END_CODE + 1;

				codeLength = Math.ceil(Math.log2(dictionarySize));
			}

			phrase = char;
		}
	}

	if (phrase !== '') {
		if (phrase.length > 1) {
			packer.write(dictionary.get(phrase), codeLength);
		} else {
			packer.write(phrase.charCodeAt(0), codeLength);
		}
	}

	packer.write(END_CODE, codeLength);
	packer.flush();
	output = output.concat(packer.result);

	output.push(0); // Empty block

	return Uint8Array.from(output);
};

module.exports = encode;
