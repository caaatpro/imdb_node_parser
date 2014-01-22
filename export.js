#!/usr/bin/env node
var program = require('commander'),
		Import = require('./lib/import'),
		fs = require('fs'),
		contentType,
		inputStream,
		outputStream;

program
	.version('0.0.2')
	.usage('node.js cli.js -t type | stream')
	.option('-t, --type [type]', 'peg filter to apply. default: movie', 'movies')
	.option('-p, --print', 'print results to STDOUT.')
	.option('-i, --input', 'accept input from STDIN.')
	.parse(process.argv);

contentType = program.type;

if(program.print){
	outputStream = process.stdout;
}

if(program.input){
	inputStream = process.stdin;
} else {
	inputStream = fs.createReadStream('./tmp/'+contentType+'.list');
}

if(!outputStream){
	console.error('please chose the output stream/file');
}

var toggleImport = new Import(inputStream, contentType, outputStream);