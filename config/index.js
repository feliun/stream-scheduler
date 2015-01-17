var conf = require('nconf');
var path = require('path');
conf.file('module environment', path.join(process.cwd(), 'config', 'config.json'));
module.exports = conf.get();