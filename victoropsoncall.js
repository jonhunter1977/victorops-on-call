var webrequest = require('./webrequest');
var config = require('./config/index');
var debug = require('debug')('victor-ops-on-call:victoropsoncall');
var Promise = require("bluebird");
var _ = require('lodash');

var isApiSecure = config.get('victorOpsApi:isSecure');
var hostname = config.get('victorOpsApi:hostname');

if(isApiSecure) {
    webRequest = require('https');
} 
else {
    webRequest = require('http');
}

module.exports = function(){

    var authorisationString = config.get('victorOpsApi:username') + ':' + config.get('victorOpsApi:password');
    var authorisation = new Buffer(authorisationString).toString('base64')

    var getOnCallRotaForAllTeams = function() {

      return new Promise(function(resolve, reject){

        var options = {
          hostname: config.get('victorOpsApi:hostname'),
          path: "/api/v1/org/laterooms/teams",
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
          hostname: config.get('victorOpsApi:hostname'),
          path: "/api/v1/org/laterooms/teams/" + teamName + "/oncall",
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

    var getPeopleOnCallForAllTeams = function(organisationOnCallData) {

      return new Promise(function(resolve, reject){

        if(organisationOnCallData === '' || organisationOnCallData === null){
          reject('no oncall data was passed');
        }

        var peopleOnCall = { "oncall" : []};

        _.forEach(organisationOnCallData, function(teamOnCallData){
          _.forEach(teamOnCallData.oncall, function(onCallRota){
            if("oncall" in onCallRota) {
              peopleOnCall.oncall.push({"team" : teamOnCallData.name,"oncall" : onCallRota.oncall});
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

  return {
    getOnCallRotaForAllTeams : getOnCallRotaForAllTeams,
    getOnCallRotaForTeam : getOnCallRotaForTeam,
    getPersonOnCallForTeam : getPersonOnCallForTeam,
    getPeopleOnCallForAllTeams : getPeopleOnCallForAllTeams
  };

}();

