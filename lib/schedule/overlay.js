var moment = require('moment');
var _ = require('lodash');

function shiftContainedByOverride(overlayStart, overlayEnd, rotationStart, rotationEnd) {
    return (overlayStart.isBefore(rotationStart) || overlayStart.isSame(rotationStart)) && (overlayEnd.isSame(rotationEnd) || overlayEnd.isAfter(rotationEnd));
}

function overrideWithinShift(overlayStart, overlayEnd, rotationStart, rotationEnd) {
	return (overlayStart.isAfter(rotationStart) || overlayStart.isSame(rotationStart)) && (overlayEnd.isBefore(rotationEnd) || overlayEnd.isSame(rotationEnd));
}

module.exports = function Overlay(overlay) {
    var overlayStart = moment(overlay.start);
    var overlayEnd = moment(overlay.end);

    return {
    	isRelevant: function(oncall, rotationStart, rotationEnd) {
            return oncall === overlay.orig 
            	&& (overrideWithinShift(rotationStart, rotationEnd, overlayStart, overlayEnd) || shiftContainedByOverride(rotationStart, rotationEnd, overlayStart, overlayEnd));
    	},
    	apply: function(oncall, rotationStart, rotationEnd) {
    		var rotationOverlayStart = overlayStart;
    		var rotationOverlayEnd = overlayEnd;

    		if (overlayStart.isBefore(rotationStart)) {
                rotationOverlayStart = moment(rotationStart);
            }

            if (rotationOverlayEnd.isAfter(rotationEnd)) {
                rotationOverlayEnd = moment(rotationEnd);
            }

            var rotations = [];

            if(!rotationOverlayStart.isSame(rotationStart)) {
                rotations.push({
                    oncall: oncall,
                    start: rotationStart.utc().format(),
                    end: rotationOverlayStart.utc().format()
                });
            }

            rotations.push({
                oncall: overlay.over,
                start: rotationOverlayStart.utc().format(),
                end: rotationOverlayEnd.utc().format()
            });

            if(!rotationOverlayEnd.isSame(rotationEnd)) {
                rotations.push({
                    oncall: oncall,
                    start: rotationOverlayEnd.utc().format(),
                    end: rotationEnd.utc().format()
                });
            }            

            return rotations;
    	}
    };
}
