var webrequest = require('./webrequest');
var config = require('./config');
var debug = require('debug')('victor-ops-on-call:victoropsoncall');
var Promise = require("bluebird");
var _ = require('lodash');
var moment = require('moment');

var isApiSecure = config.get('victorOpsApi:isSecure') ? 'https://' : 'http://';
var hostname = config.get('victorOpsApi:hostname');

var getOnCallRotationForAllTeams = require('./lib/schedule');

module.exports = function(){

    var authorisationString = config.get('victorOpsCredentials:username') + ':' + config.get('victorOpsCredentials:password');
    var authorisation = new Buffer(authorisationString).toString('base64')

    var getOnCallRotaForAllTeams = function() {

      return new Promise(function(resolve, reject){

        var options = {
          url: isApiSecure + hostname + "/api/v1/org/laterooms/teams?days_forward=28",
          method: "GET",
          headers: {
            "Accept": "application/json",
            "Authorization": authorisation
          }
        };

        webrequest.callApi(options).then(function(data){
          resolve(data);
        }).catch(function(err){
          reject(err);
        })
      });
    };

    var getOnCallRotaForTeam = function(teamName) {

      return new Promise(function(resolve, reject){

        var options = {
          url: isApiSecure + hostname + "/api/v1/org/laterooms/teams/" + teamName + "/oncall",
          method: "GET",
          headers: {
            "Accept": "application/json",
            "Authorization": authorisation
          }
        };

        webrequest.callApi(options).then(function(data){
          resolve(data);
        }).catch(function(err){
          reject(err);
        })
      });
    };

    var getPersonOnCallForTeam = function(organisationOnCallData, teamName){

      return new Promise(function(resolve, reject){
        var teamOnCallData =  _.find(organisationOnCallData, {"name" : teamName});
        if(teamOnCallData){
          resolve(teamOnCallData.oncall[0].oncall);
        }
        else {
          reject('no data found for team : ' + teamName);
        }
      });
    }

    var getMatchingOverlay = function(overlays) {
      var currentTime = moment().valueOf();

      var matchingOverlays = _.filter(overlays, function(overlay) {
        return currentTime >= overlay.start && currentTime <= overlay.end;
      });

      if(!matchingOverlays.length) {
        return;
      }

      return _.first(matchingOverlays);
    };

    var getPeopleOnCallForAllTeams = function(organisationOnCallData) {

      return new Promise(function(resolve, reject){

        if(organisationOnCallData === '' || organisationOnCallData === null){
          reject('no oncall data was passed');
        }

        var peopleOnCall = { "oncall" : [] };

        _.forEach(organisationOnCallData, function(teamOnCallData){
          _.forEach(teamOnCallData.oncall, function(onCallRota){
            if('oncall' in onCallRota) {
              var override = getMatchingOverlay(teamOnCallData.overlays);

              peopleOnCall.oncall.push({"team" : teamOnCallData.name,"oncall" : override ? override.over : onCallRota.oncall});
              return false;
            }
          });
        });

        if(peopleOnCall.oncall.length === 0){
          reject('No oncall data found for any teams');
        }
        else {
          resolve(peopleOnCall);
        }
        
      });
    }

    var hasRotaChanged = function(oldRota, newRota){
      return new Promise(function(resolve, reject){

          if(oldRota === '' || oldRota === null || typeof oldRota === 'undefined' || oldRota.length === 0 || 
            newRota === '' || newRota === null || typeof newRota === 'undefined'|| newRota.length === 0 ){
            reject('some or all rota data was not supplied');
          }

          var isEqual = _.isEqual(oldRota, newRota);
          resolve(!isEqual);
      });
    }

  return {
    getOnCallRotaForAllTeams: getOnCallRotaForAllTeams,
    getOnCallRotaForTeam: getOnCallRotaForTeam,
    getPersonOnCallForTeam: getPersonOnCallForTeam,
    getPeopleOnCallForAllTeams: getPeopleOnCallForAllTeams,
    getOnCallRotationForAllTeams: getOnCallRotationForAllTeams,
    hasRotaChanged: hasRotaChanged
  };

}();

