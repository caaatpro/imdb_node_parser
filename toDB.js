"use strict";

var program = require('commander'),
    LineByLineReader = require('line-by-line'),
    request = require('request');

program
    .version('0.0.1')
    .option('-f, --from [filename]', 'read from the [filename]')
    .parse(process.argv);

if (!program.from) {
    console.error('please chose the input file');
    process.exit(1);
}



var rl = new LineByLineReader(program.from);

rl.on('error', function (err) {
	// 'err' contains error object
});

rl.on('line', function (line) {
	// pause emitting of lines...
	rl.pause();

  request.post('http://127.0.0.1:7000/movie').form(JSON.parse(line))
      .on('response', function(response) {
        // console.log(response);
        rl.resume();
      })
      .on('error', function(err) {
          console.error(err);
      });
});

rl.on('end', function () {
	console.log('End')
});
