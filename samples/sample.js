var ss = require('../index');
var JSONStream = require('JSONStream');
var es = require('event-stream');

module.exports = (function() {
	
	var stream1 = JSONStream.parse('.*');
	stream1.on('data', function (item) { console.log('This could process a json!', item); });
    stream1.on('end', function () { console.log('end JSON!'); });

	var stream2 = es.mapSync(function (data) {
	    console.log('Stream 2');
	    return data;
	});

	var stream3 = es.through(function write(data) {
			console.log('Stream 3');
			this.emit('data', data);
		},
		function end() {
			console.log('End Stream 3');
			this.emit('end');
		}
	);

	var options = {
		schedule: '42 * * * *',
		onStartExec: function() { console.log('Just started!'); },
		url: 'http://echo.jsontest.com/insert-key-here/insert-value-here/key/value',
		pipeline: [ stream1, stream2, stream3 ],
		startNow: true
	}

	ss.init(options);

	setTimeout(function() {
		console.log('Is the job executing?: ', ss.isExecuting());
	}, 100);

	setTimeout(function() {
		console.log('The job executed last time at: ', new Date(ss.lastExecutionTime()));
		ss.startExecution(); //Forcing to execute out of its interval
	}, 7000)
})()