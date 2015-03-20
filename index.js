var _ = require('lodash');
var https = require('https');
var http = require('http');
var schedule = require('node-schedule');
var config = require('./config');

var interval, scheduleConfig, onData, onEnd, onError, url, pipeline, handler,
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
		response.on('data', function(chunk) { onData(chunk); })
				.on('end', function() { executeInSeries([ onEnd, unlockExecution, setLastExecutionTime ]) })
				.on('error', function(err){ executeInSeries([ onError.bind(null, err), unlockExecution, setLastErrorTime ]) })
	});
}

function configure(options) {
	interval = options.interval;
	scheduleConfig = options.schedule;
	pipeline = options.pipeline;
	onStartExec = options.onStartExec || _.noop;
	onData = options.onData || _.noop;		
	onEnd = options.onEnd || _.noop;		
	onError = options.onError || _.noop;
	url = options.url;
	handler = url.slice(0, 5) === 'https' ? https : http;
	isExecuting = false;
	
	if (_.isEmpty(pipeline) && !options.onData) throw new Error("At least one stream is required to provide functionality");
	if (!url) throw new Error("A url is required to stream data");
	if (!scheduleConfig && !interval) throw new Error("It is mandatory to specify an interval or a schedule to run the request");

	if (options.startNow) executeRequest();
	if (interval) setInterval(executeRequest, interval * 1000);
	if (scheduleConfig) schedule.scheduleJob(scheduleConfig, executeRequest);
}

function isExecuting() { 
	return isExecuting; 
}

function getLastExecutionTime() {
	return lastExecutionTime;
}

function startExecution() {
	if (isExecuting) return false;
	executeRequest();
	return true;
}

function updatePipeline(_pipeline) {
	pipeline = _pipeline;
}

module.exports = {
	init: configure,
	isExecuting: isExecuting,
	updatePipeline: updatePipeline,
	startExecution: startExecution,
	getLastExecutionTime: getLastExecutionTime
}