'use strict';

module.exports = {
    "victorOpsApi": {
        "isSecure": true,
        "hostname": "portal.victorops.com"
    },
    "applicationSettings": {
        "pollingIntervalSeconds": 300,
        "alwaysNotify": false
    },
    "rabbit": { 
        "defaultMessageType": "victorops",
        "defaultTeam": "all",
        "exchange": "river-styx",
        "routingKey": "victorops-oncall",
        "rabbitConfig": {
            "host": "10.44.72.42"
        }
    },
    "redis": {
        "port": 6379,
        "host": "10.44.72.53"
    }
};
