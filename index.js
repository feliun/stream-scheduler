var _ = require('lodash');
var https = require('https');
var http = require('http');
var config = require('./config');

module.exports = function(options) {
	var interval = options.interval || config.options.interval;
	var onData = options.onData || _.noop();
	var onEnd = options.onEnd || _.noop();
	var onError = options.onError || _.noop();
	var url = options.url;
	if (!url) return onError("A url is required to stream data from");
	var handler = url.slice(0, 5) === 'https' ? https : http;
	var isExecuting = false;
	var lastExecutionTime, lastErrorTime;

	var executeInSeries = function(fnList) { _.each(fnList, function(fn) { fn(); }) }
	
	var lockExecution = function() { isExecuting = true; }
	var unlockExecution = function() { isExecuting = false; }
	
	var setLastExecutionTime = function() { lastExecutionTime = new Date().getTime(); }
	var setLastErrorTime = function() { lastErrorTime = new Date().getTime(); }

	var executeRequest = function() {
		lockExecution();
		handler.get(url, function(response) {
        	response.on('data', executeInSeries([ onData.bind(null, response) ]))
        			.on('end', executeInSeries([ onEnd, unlockExecution, setLastExecutionTime ]))
        			.on('error', executeInSeries([ onError, unlockExecution, setLastErrorTime ]));
		}
	}

	if (options.startNow) executeRequest();
	setInterval(executeRequest, interval);

	function isExecuting() { 
		return isExecuting; 
	}

	function lastExecutionTime() {
		return lastExecutionTime;
	}
	
	function startExecution() {
		if (!isExecuting) executeRequest();
	}

	function stopExecution() {

	}

	return {
		isExecuting: isExecuting,
		startExecution: startExecution,
		stopExecution: stopExecution,
		lastExecutionTime: lastExecutionTime
	}
}