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


var iii = 0;
var t = 0;

var rl = new LineByLineReader(program.from);

rl.on('error', function (err) {
	// 'err' contains error object
});

rl.on('line', function (line) {
	// pause emitting of lines...
	t++;
	if (t === 10) {
	   rl.pause();
  }


  request.post('http://127.0.0.1:7000/movie').form(JSON.parse(line))
      .on('response', function(response) {
        console.log(++iii);
        t=0;
        rl.resume();
      })
      .on('error', function(err) {
          console.error(err);
      });
});

rl.on('end', function () {
	console.log('End');
});
