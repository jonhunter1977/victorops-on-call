var webrequest = require('./webrequest');
var config = require('./config');
var debug = require('debug')('victor-ops-on-call:victoropsoncall');
var Promise = require("bluebird");
var _ = require('lodash');
var moment = require('moment');

var isApiSecure = config.get('victorOpsApi:isSecure') ? 'https://' : 'http://';
var hostname = config.get('victorOpsApi:hostname');

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

    var getOnCallRotationForAllTeams = function(organisationOnCallData) {
      return new Promise(function(resolve, reject){

        if(organisationOnCallData === '' || organisationOnCallData === null){
          reject('no oncall data was passed');
        }

        var onCall = _.reduce(organisationOnCallData, function(allTeams, team) {
          var currentRotation = _.chain(team.oncall).filter(function(rotation) { return rotation.oncall }).first().value();
          var allRotations =  _.sortBy(Array.prototype.concat.apply([], _.pluck(team.oncall, 'rolls')), function(rotation) {
            return rotation.change;
          });

          if(!currentRotation) {
            allTeams[team.name] = {
              current: 'No-one',
              schedule: []
            };

            return allTeams;
          }

          allTeams[team.name] = {
            current: currentRotation.oncall,
            schedule: _.reduce(allRotations, function(allRotations, rotation, i) {
              var rotationStart = moment(rotation.change);
              var rotationEnd = moment(rotation.until);
              var oncall = rotation.oncall;

              var matchingOverlay = _.chain(team.overlays).filter(function(overlay) {
                var overlayStart = moment(overlay.start);
                var overlayEnd = moment(overlay.end);

                return (overlayStart.isAfter(rotationStart) || overlayStart.isSame(rotationStart)) 
                  && (overlayEnd.isBefore(rotationEnd) || overlayEnd.isSame(rotationEnd));
              }).first().value();

              var newRotations = [];

              if(matchingOverlay) {
                var newRotations = [];

                if(moment(matchingOverlay.start).isSame(rotationStart) && moment(matchingOverlay.end).isSame(rotationEnd)) {
                  newRotations.push({
                    oncall: matchingOverlay.over,
                    start: moment(matchingOverlay.start).utc().format(),
                    end: moment(matchingOverlay.end).utc().format()
                  });
                }
                else if(moment(matchingOverlay.start).isSame(rotationStart)) {
                  newRotations = newRotations.concat([{
                      oncall: matchingOverlay.over,
                      start: moment(matchingOverlay.start).utc().format(),
                      end: moment(matchingOverlay.end).utc().format()
                    },
                    {
                      oncall: oncall,
                      start: moment(matchingOverlay.end).utc().format(),
                      end: rotationEnd.utc().format()
                    }]);
                }
                else if(moment(matchingOverlay.end).isSame(rotationEnd)) {
                  newRotations = newRotations.concat([{
                      oncall: oncall,
                      start: rotationStart.utc().format(),
                      end: moment(matchingOverlay.start).utc().format()
                    },
                    {
                      oncall: matchingOverlay.over,
                      start: moment(matchingOverlay.start).utc().format(),
                      end: moment(matchingOverlay.end).utc().format()
                    }]);
                }
                else {
                  newRotations = newRotations.concat([{
                      oncall: oncall,
                      start: rotationStart.utc().format(),
                      end: moment(matchingOverlay.start).utc().format()
                    },
                    {
                      oncall: matchingOverlay.over,
                      start: moment(matchingOverlay.start).utc().format(),
                      end: moment(matchingOverlay.end).utc().format()
                    },
                    {
                      oncall: oncall,
                      start: moment(matchingOverlay.end).utc().format(),
                      end: rotationEnd.utc().format()
                    }]);
                }
              }
              else {
                newRotations.push({
                  oncall: oncall,
                  start: rotationStart.utc().format(),
                  end: rotationEnd.utc().format()
                });
              }

              if(newRotations.length && allRotations.length && allRotations[allRotations.length - 1].oncall === newRotations[0].oncall) {
                allRotations[allRotations.length - 1].end = newRotations.shift().end;
              }

              return allRotations.concat(newRotations);
            }, [])
          };


          return allTeams;
        }, {});

        resolve({
          teams: onCall
        });
      });
    }

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
    getOnCallRotaForAllTeams : getOnCallRotaForAllTeams,
    getOnCallRotaForTeam : getOnCallRotaForTeam,
    getPersonOnCallForTeam : getPersonOnCallForTeam,
    getPeopleOnCallForAllTeams : getPeopleOnCallForAllTeams,
    getOnCallRotationForAllTeams: getOnCallRotationForAllTeams,
    hasRotaChanged : hasRotaChanged
  };

}();

