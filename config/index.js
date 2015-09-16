'use strict';

var nconf = require('nconf'),
    fs = require('fs'),
    debug = require('debug')('victor-ops-on-call:config:index');

nconf.argv();
nconf.env('_');

var victorOpsCredentialsFile = './config/victorops-credentials.json';
if (fs.existsSync(victorOpsCredentialsFile)) {
    nconf.file(victorOpsCredentialsFile);
    debug(new Date(), 'Victorops credentials file loaded');
}
else {
    debug(new Date(), 'No victorops credentials file found');
}

var environment = process.env.NODE_ENV;

if (environment) {
    debug(new Date(), 'Using configuration file : ' + environment + '.js');
    var env = require('../config/' + environment);
    nconf.overrides(env);
}
else {
    debug(new Date(), 'Using default configuration');
}

var defaults = require('../config/default');
nconf.defaults(defaults);

module.exports = {
    get: function (key) {
        return nconf.get(key);
    }
};
