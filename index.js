var _ = require('lodash');
var https = require('https');
var http = require('http');
var config = require('./config');
var csv = require("fast-csv");

var interval, onData, onEnd, onError, url, 
	handler, csvConfig,
	isExecuting, lastExecutionTime, lastErrorTime;

var executeInSeries = function(fnList) { _.each(fnList, function(fn) { fn(); }) };

var lockExecution = function() { isExecuting = true; };
var unlockExecution = function() { isExecuting = false; };

var setLastExecutionTime = function() { lastExecutionTime = new Date().getTime(); };
var setLastErrorTime = function() { lastErrorTime = new Date().getTime(); };

var executeRequest = function() {
	executeInSeries([ lockExecution, onStartExec ]);
	handler.get(url, function(response) {
		if (csvConfig) response = csv.fromStream(response, csvConfig);
    	response.on('data', function(chunk) { onData(chunk); })
    			.on('end', function() { executeInSeries([ onEnd, unlockExecution, setLastExecutionTime ]) })
    			.on('error', function(err){ executeInSeries([ onError.bind(null, err), unlockExecution, setLastErrorTime ]) });
	});
}

function configure(options) {
	interval = options.interval || config.options.interval;
	csvConfig = options.csvConfig;
	onStartExec = options.onStartExec || _.noop;
	onData = options.onData || _.noop;
	onEnd = options.onEnd || _.noop;
	onError = options.onError || _.noop;
	url = options.url;
	if (!url) return onError("A url is required to stream data");
	handler = url.slice(0, 5) === 'https' ? https : http;
	isExecuting = false;

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