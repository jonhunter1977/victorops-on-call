var webrequest = require('./webrequest');;
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

    var getPersonOnCallForGroup = function(data, group){

      return new Promise(function(resolve, reject){
        var groupData =  _.find(data, {"name" : group});
        if(groupData){
          resolve(groupData.oncall[0].oncall);
        }
        else {
          reject('no data found for group : ' + group);
        }
      });
    }

    var getCurrentPersonOnCallForRequestedDate = function(data, dateEpoch){

    }

  return {
    getOnCallRotaForAllTeams : getOnCallRotaForAllTeams,
    getPersonOnCallForGroup : getPersonOnCallForGroup,
    getCurrentPersonOnCallForRequestedDate : getCurrentPersonOnCallForRequestedDate
  };

}();

