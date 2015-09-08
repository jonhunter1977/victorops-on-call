var debug = require('debug')('victor-ops-on-call:app');
var victoropsoncall = require('./victoropsoncall.js');
var config = require('./config/index');
//var Promise = require("bluebird");

var interval = config.get('applicationSettings:pollingIntervalSeconds') * 1000 || 5000;
debug('Polling interval in ms : ' + interval);

setInterval(function(){

    victoropsoncall.getOnCallRotaForAllTeams().then(function(data){
        var onCallData = JSON.parse(data);
        debug(onCallData);
    }).catch(function(err){
        debug('ERROR : ' + err);
    });

}, interval);