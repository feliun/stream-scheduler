var _ = require('lodash');
var https = require('https');
var http = require('http');
var config = require('./config');

var interval, onData, onEnd, onError, url, 
	handler, 
	isExecuting, lastExecutionTime, lastErrorTime;

function configure(options) {
	interval = options.interval || config.options.interval;
	onData = options.onData || _.noop;
	onEnd = options.onEnd || _.noop;
	onError = options.onError || _.noop;
	url = options.url;
	if (!url) return onError("A url is required to stream data");
	handler = url.slice(0, 5) === 'https' ? https : http;
	isExecuting = false;

	var executeInSeries = function(fnList) { _.each(fnList, function(fn) { fn(); }) }
	
	var lockExecution = function() { isExecuting = true; }
	var unlockExecution = function() { isExecuting = false; }
	
	var setLastExecutionTime = function() { lastExecutionTime = new Date().getTime(); }
	var setLastErrorTime = function() { lastErrorTime = new Date().getTime(); }

	var executeRequest = function() {
		lockExecution();
		handler.get(url, function(response) {
        	response.on('data', function(chunk) { onData(chunk); })
        			.on('end', function() { executeInSeries([ onEnd, unlockExecution, setLastExecutionTime ]) })
        			.on('error', function(err){ executeInSeries([ onError.bind(null, err), unlockExecution, setLastErrorTime ]) });
		});
	}

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