var _ = require('lodash');
var https = require('https');
var http = require('http');
var config = require('./config');

module.exports = function(options) {
	var interval = options.interval || config.options.interval;
}