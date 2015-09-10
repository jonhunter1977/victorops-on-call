var debug = require('debug')('victor-ops-on-call:app');
var victoropsoncall = require('./victoropsoncall.js');
var redis = require('./redis.js');
var config = require('./config/index');
var Promise = require("bluebird");

var interval = config.get('applicationSettings:pollingIntervalSeconds') * 1000 || 5000;
debug('Polling interval in ms : ' + interval);

var hash = 'oncall';

redis.deleteHash(hash).then(function(){

    setInterval(function(){

        var currentPeopleOnCallForAllTeams, currentOnCallStoredData;

        victoropsoncall.getOnCallRotaForAllTeams().then(function(data){
            var onCallData = JSON.parse(data);
            return victoropsoncall.getPeopleOnCallForAllTeams(onCallData);
        }).then(function(data){
            currentPeopleOnCallForAllTeams = data;
            //debug('currentPeopleOnCallForAllTeams', currentPeopleOnCallForAllTeams);
            return redis.getHash(hash);
        }).then(function(data){            
            if(data == null) {
                //Add the data to redis for the first time
                redis.setHash(hash, {"oncall" : JSON.stringify(currentPeopleOnCallForAllTeams.oncall)});
                return new Promise(function(resolve){
                    resolve(false);
                })
            }
            else {
                //Check if the data has changed and update redis if required
                currentOnCallStoredData = data;
                return victoropsoncall.hasRotaChanged(JSON.parse(currentOnCallStoredData.oncall), currentPeopleOnCallForAllTeams.oncall);
            }
        }).then(function(data){
            console.log('data has changed ? : ' + data);
        }).catch(function(err){
            var stackTrace = new Error();
            debug(err, err.stack);
        });

    }, interval);
});