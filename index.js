var _ = require('lodash');
var https = require('https');
var http = require('http');
var config = require('./config');

module.exports = function(options) {
	var interval = options.interval || config.options.interval;
	var url = options.url;
	var onData = options.onData || _.noop();
	var onEnd = options.onEnd || _.noop();
	var onError = options.onError || _.noop();
}