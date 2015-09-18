var debug = require('debug')('victor-ops-on-call:notifiers:riverStyxNotifier');
var config = require('../config/index');

var rabbitConfig = config.get('rabbit') || {};
debug(rabbitConfig);
var riverStyx = new require('../lib/rabbit')(rabbitConfig);

riverStyx.start(function(err){
    if(err) {
        debug(new Date(), 'River Styx notifier require error : ', err.message);
    }

    debug(new Date(), 'River Styx notifier required');
});

module.exports = function(data){

    debug(new Date(), 'River Styx notifier called');

    riverStyx.publish(data, rabbitConfig, function(err){
        debug(new Date(), 'On call data sent to river Styx');
    });
}