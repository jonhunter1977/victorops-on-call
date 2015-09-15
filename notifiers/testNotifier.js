var debug = require('debug')('victor-ops-on-call:notifiers:testNotifier');

debug('Test notifier required');

module.exports = function(data){
    debug('Test notifier called');
    debug(data);
}
