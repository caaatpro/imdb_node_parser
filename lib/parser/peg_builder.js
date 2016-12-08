'use strict';

var fs = require('fs');
var peg = require('pegjs');
var path = require('path');

/**
 * Build PEG parser from *.pegjs file
 * @param filename
 * @returns {*}
 */
function buildPEG(filename){
	var file = fs.readFileSync(path.join(__dirname, filename), 'utf8'),
		parser = peg.generate(file).parse;

	return parser;
}

module.exports = buildPEG;
