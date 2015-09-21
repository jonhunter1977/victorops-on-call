var config = require('./config/index');
var debug = require('debug')('victor-ops-on-call:redis');
var redis = require('redis');
var Promise = require("bluebird");

var redisPort = config.get('redis:port');
var redisHost = config.get('redis:host')

module.exports = function() {

    var getHash = function(hash){

        var client = redis.createClient(redisPort, redisHost);

        return new Promise(function(resolve, reject){
            client.hgetall(hash, function (err, obj) {

                if(err) {
                    client.quit();
                    reject(err);
                }

                client.quit();
                resolve(obj);
            });
        })
    }

    var setHash = function(hash, obj){

        var client = redis.createClient(redisPort, redisHost);

        return new Promise(function(resolve, reject){
            client.hmset(hash, obj, function (err, obj) {

                if(err) {
                    client.quit();
                    reject(err);
                }

                client.quit();
                resolve(obj);
            });
        })
    }

    var deleteHash = function(hash){

        var client = redis.createClient(redisPort, redisHost);

        return new Promise(function(resolve, reject){
            client.del(hash, function (err, obj) {

                if(err) {
                    client.quit();
                    reject(err);
                }

                client.quit();
                resolve(obj);
            });
        })        
    }

    return {
        getHash : getHash,
        setHash : setHash,
        deleteHash : deleteHash
    }
}();