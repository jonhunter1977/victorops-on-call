var debug = require('debug')('victor-ops-on-call:notifiers:testNotifier');

debug(new Date(), 'Test notifier required');

module.exports = function(data){
    debug(new Date(), 'Test notifier called');
    debug(new Date(), data);
}
