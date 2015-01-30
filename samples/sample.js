var ss = require('../index');

module.exports = (function() {
	var options = {
		interval: 6, //6 seconds to run the job
		onStartExec: function() {
			console.log('Just started!');
		},
		onData: function(chunk) {
			console.log('Received: ', chunk); //Comment this out to perceive the rest of the execution
		},
		onEnd: function() {
			console.log('Finished!');
		},
		onError: function(err) {
			console.log('Houston, we\'ve got a problem: ', err);
		},
		url: 'http://localhost:3000/mycsv',
		csvConfig: {
			headers: true
		},
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