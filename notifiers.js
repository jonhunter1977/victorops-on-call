var debug = require('debug')('victor-ops-on-call:notifiers');

module.exports = function(){

    var notifiers = [];

    var registerNotifier = function(notifier){
        notifiers.push(notifier);
    }

    var clearAllNotifiers = function(notifier){
        notifiers = [];
    }

    var runAllNotifiers = function(data){
        notifiers.forEach(function(notifier){
            notifier.call(this, data);
        });
    }

    return {
        registerNotifier : registerNotifier,
        runAllNotifiers : runAllNotifiers,
        clearAllNotifiers : clearAllNotifiers
    }

}()