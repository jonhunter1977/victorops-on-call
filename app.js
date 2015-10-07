var debug = require('debug')('victor-ops-on-call:app');
var victoropsoncall = require('./victoropsoncall.js');
var redis = require('./redis.js');
var config = require('./config/index');
var Promise = require("bluebird");
var notifiers = require('./notifiers.js');
var fs = require('fs');

var interval = config.get('applicationSettings:pollingIntervalSeconds') * 1000 || 5000;
debug(new Date(), 'Polling interval in ms : ' + interval);

//debug(new Date(), process.env);

var hash = 'oncallrota';

//get all the notifiers
fs.readdir('./notifiers/', function(err, files){
    if(err){
        return debug(new Date(), 'No notifiers were registered : ' + err);
    }

    files.forEach(function(notifier){
        debug(new Date(), 'Adding notifier : ./notifiers/' + notifier);
        notifiers.registerNotifier(require('./notifiers/' + notifier));
    });    
})

function storeRotation(onCallData) {
    victoropsoncall.getOnCallRotationForAllTeams(onCallData).then(function(data) {
        return redis.setHash('oncallSchedule', data);
    });
}

redis.deleteHash(hash).then(function(){

    setInterval(function(){

        var currentOnCallDataRetrievedFromVictorOps, currentOnCallDataStoredInRedis;

        victoropsoncall.getOnCallRotaForAllTeams().then(function(data){
            var onCallData = JSON.parse(data);

            storeRotation();

            return victoropsoncall.getPeopleOnCallForAllTeams(onCallData);
        }).then(function(data){
            currentOnCallDataRetrievedFromVictorOps = data;

            return redis.getHash(hash);
        }).then(function(data){            
            if(data == null) {
                return new Promise(function(resolve){
                    resolve(true);
                })
            }
            else {
                //Check if the data has changed and update redis if required
                currentOnCallDataStoredInRedis = data;
                return victoropsoncall.hasRotaChanged(JSON.parse(currentOnCallDataStoredInRedis.oncall), currentOnCallDataRetrievedFromVictorOps.oncall);
            }
        }).then(function(onCallDataHasChanged){

            var onCallData;
            if(currentOnCallDataStoredInRedis === undefined || onCallDataHasChanged){
                onCallData = currentOnCallDataRetrievedFromVictorOps;
            }
            else {
                onCallData = {
                    'oncall' : JSON.parse(currentOnCallDataStoredInRedis.oncall)
                };
            }

            if(onCallDataHasChanged || config.get('applicationSettings:alwaysNotify')){ 
                notifiers.runAllNotifiers(onCallData);
            }
            else {
                debug(new Date(), 'On call data has not changed since last check');
            }

            //store the new data in redis
            return redis.setHash(hash, {'oncall' : JSON.stringify(onCallData.oncall)});
        }).catch(function(err){
            var stackTrace = new Error();
            debug(new Date(), err, stackTrace.stack);
        });

    }, interval);
});