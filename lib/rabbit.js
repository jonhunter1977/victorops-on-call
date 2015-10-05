'use strict';

var debug = require('debug')('victor-ops-on-call:lib:rabbit');
var moment = require('moment');

module.exports = function(options) {
    var _options = options || {};

    var amqp = require('amqp');
    var _originServer = require("os").hostname();

    var _routingKey = (options.routingKey !== undefined) ? options.routingKey : 'rabbit-key';
    var _exchangeName = (options.exchange !== undefined) ? options.exchange : 'rabbit-exchange';
    var _connected = false;
    var _openned = false;
    var _defaultMessageType = (options.defaultMessageType !== undefined) ? options.defaultMessageType : 'rabbit-document';
    var _detaultTeam = (options.defaultTeam !== undefined) ? options.defaultTeam : 'all';
    
    var _connection;
    var _exchange;
    
    return {
        start: function(callback) {
            _connection = amqp.createConnection(_options.rabbitConfig);
            
            _connection.on('error', function(e) {
                debug(new Date(), 'Error connecting to rabbit mq : ' + e);
                return callback('Error connecting to rabbit mq : ' + e);
            });

            _connection.on('ready', function(){
                if(_connected) {  
                    return; 
                }
                _connected = true;

                debug(new Date(), "Rabbit MQ Message bus has started.");

                _exchange = _connection.exchange(_exchangeName, { type: 'fanout', durable: false, autoDelete: false })

                .on('open', function(exchange) {
                    if(!_openned){
                        _openned = true;
                        callback();
                    }
                });
            });
        },
        publish: function(message, options, callback){
            if(!_connected) {
                debug(new Date(), 'Tried to send message when not connected');
                return;
            }

            var routingKey = (typeof options !== "function") && (options.routingKey !== undefined) ? options.routingKey : _routingKey;
            var messageType = (typeof options !== "function") && (options.messageType !== undefined) ? options.messageType : _defaultMessageType;
            var team = (typeof options !== "function") && (options.team !== undefined) ? options.team : _detaultTeam;

            var _message = { 
                '@timestamp': moment().format(),
                type: messageType,
                team: team,
                routingKey: routingKey,
                originServer: _originServer,
                message: message
            };

            _exchange.publish(_routingKey, JSON.stringify(_message));
            // INVESTIGATE, callback on publish isnt working for some reason
            ((typeof options === "function") ? options : callback)();
        }
    }
};