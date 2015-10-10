var debug = require('debug')('victor-ops-on-call:app');
var victoropsoncall = require('./victoropsoncall.js');
var redis = require('./redis.js');
var config = require('./config/index');
var Promise = require("bluebird");
var notifiers = require('./notifiers.js');
var fs = require('fs');

var interval = config.get('applicationSettings:pollingIntervalSeconds') * 1000 || 5000;
debug(new Date(), 'Polling interval in ms : ' + interval);

var hash = 'oncallrota';

function registerNotifiers () {
    return new Promise(function(resolve, reject) {
        fs.readdir('./notifiers/', function(err, files){
            if(err){
                return reject('No notifiers were registered : ' + err);
            }

            files.forEach(function(notifier){
                debug(new Date(), 'Adding notifier : ./notifiers/' + notifier);
                notifiers.registerNotifier(require('./notifiers/' + notifier));
            });

            resolve();
        });
    });
}

function storeRotation(onCallData) {
    victoropsoncall.getOnCallRotationForAllTeams(onCallData).then(function(data) {
        return redis.setHash('oncallSchedule', { teams: JSON.stringify(data.teams) });
    });
}

function refreshOnCallData(){
    var currentOnCallDataRetrievedFromVictorOps, currentOnCallDataStoredInRedis;

    victoropsoncall.getOnCallRotaForAllTeams()
        .then(function(data){
            var onCallData = JSON.parse(data);

            storeRotation(onCallData);

            return victoropsoncall.getPeopleOnCallForAllTeams(onCallData);
        })
        .then(function(data){
            currentOnCallDataRetrievedFromVictorOps = data;

            return redis.getHash(hash);
        })
        .then(function(data){            
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
        })
        .then(function(onCallDataHasChanged){
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
                return redis.setHash(hash, {'oncall' : JSON.stringify(onCallData.oncall)});
            }
            else {
                debug(new Date(), 'On call data has not changed since last check');
            }

            debug(new Date(), 'Scheduling next check for: ' + interval + 'ms');
            setTimeout(refreshOnCallData, interval);
        })
        .catch(function(err){
            var stackTrace = new Error();
            debug(new Date(), err, stackTrace.stack);
            
            debug(new Date(), 'Scheduling next check for: ' + interval + 'ms');
            setTimeout(refreshOnCallData, interval);
        });

}

registerNotifiers()
    .then(redis.deleteHash.bind(undefined, hash))
    .then(refreshOnCallData);
