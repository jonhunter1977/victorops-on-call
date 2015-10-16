var Promise = require("bluebird");
var _ = require('lodash');
var moment = require('moment');
var Overlay = require('./overlay')

module.exports = function(organisationOnCallData) {
    return new Promise(function(resolve, reject) {
        if (organisationOnCallData === '' || organisationOnCallData === null) {
            reject('no oncall data was passed');
        }

        var onCall = _.reduce(organisationOnCallData, function(allTeams, team) {
            var currentRotation = _.chain(team.oncall).filter(function(rotation) {
                return rotation.oncall
            }).first().value();

            var allRotations = _.sortBy(Array.prototype.concat.apply([], _.pluck(team.oncall, 'rolls')), function(rotation) {
                return rotation.change;
            });

            if (!currentRotation) {
                allTeams[team.name] = {
                    current: 'No-one',
                    schedule: []
                };

                return allTeams;
            }

            var overlays = _.map(team.overlays, function(overlay) {
            	return new Overlay(overlay);
            });

            allTeams[team.name] = {
                current: currentRotation.overrideoncall || currentRotation.oncall,
                schedule: _.reduce(allRotations, function(allRotations, rotation, i) {
                    var rotationStart = moment(rotation.change);
                    var rotationEnd = moment(rotation.until);
                    var oncall = rotation.oncall;

                    var matchingOverlay = _.chain(overlays).filter(function(overlay) {
                    	return overlay.isRelevant(oncall, rotationStart, rotationEnd);
                    }).first().value();

		            var newRotations = matchingOverlay ? matchingOverlay.apply(oncall, rotationStart, rotationEnd) : [{
	                    oncall: oncall,
	                    start: rotationStart.utc().format(),
	                    end: rotationEnd.utc().format()
	                }];

                    if (newRotations.length && allRotations.length && allRotations[allRotations.length - 1].oncall === newRotations[0].oncall) {
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
};
