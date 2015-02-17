var _ = require('lodash');
var https = require('https');
var http = require('http');
var config = require('./config');

var interval, url, pipeline, handler,
	isExecuting, lastExecutionTime, lastErrorTime;

var executeInSeries = function(fnList) { _.each(fnList, function(fn) { fn(); }) };

var lockExecution = function() { isExecuting = true; };
var unlockExecution = function() { isExecuting = false; };

var setLastExecutionTime = function() { lastExecutionTime = new Date().getTime(); };
var setLastErrorTime = function() { lastErrorTime = new Date().getTime(); };

var executeRequest = function() {
	executeInSeries([ lockExecution, onStartExec ]);
	handler.get(url, function(response) {
		_.each(pipeline, function(stream) { response.pipe(stream); });
		response.on('end', function() { executeInSeries([ unlockExecution, setLastExecutionTime ]) })
				.on('error', function(err){ executeInSeries([ unlockExecution, setLastErrorTime ]) });
	});
}

function configure(options) {
	interval = options.interval || config.options.interval;
	pipeline = options.pipeline;
	onStartExec = options.onStartExec || _.noop;
	url = options.url;
	handler = url.slice(0, 5) === 'https' ? https : http;
	isExecuting = false;
	
	if (_.isEmpty(pipeline)) throw new Error("At least one stream is required to provide functionality");
	if (!url) throw new Error("A url is required to stream data");

	if (options.startNow) executeRequest();
	setInterval(executeRequest, interval * 1000);
}

function isExecuting() { 
	return isExecuting; 
}

function lastExecutionTime() {
	return lastExecutionTime;
}

function startExecution() {
	if (!isExecuting) executeRequest();
}

module.exports = {
	init: configure,
	isExecuting: isExecuting,
	startExecution: startExecution,
	lastExecutionTime: lastExecutionTime
}