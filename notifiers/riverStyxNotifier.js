var debug = require('debug')('victor-ops-on-call:notifiers:riverStyxNotifier');
var config = require('../config/index');

var rabbitConfig = config.get('rabbit') || {};
var riverStyx = new require('../lib/rabbit')(rabbitConfig);

riverStyx.start(function(err){
    if(err) {
        debug('River Styx notifier require error : ', err.message);
    }

    debug('River Styx notifier required');
});

module.exports = function(data){

    debug('River Styx notifier called');

    riverStyx.publish(data, rabbitConfig, function(err){
        debug('On call data sent to river Styx');
    });
}