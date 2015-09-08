var webRequest;
var config = require('./config/index');
var debug = require('debug')('victor-ops-on-call:webrequest');
var Promise = require("bluebird");

var isApiSecure = config.get('victorOpsApi:isSecure');

if(isApiSecure) {
    webRequest = require('https');
} 
else {
    webRequest = require('http');
}

module.exports = function(){

  var callApi = function(options){ 
    
    return new Promise(function(resolve, reject){
      
      var reqData = '';

      var req = webRequest.request(options, function(res) {

          res.setEncoding('utf8');

          res.on('data', function (data) {
              reqData += data;
          });

          res.on('end', function (data) {
              resolve(reqData);
          });

          res.on('error', function (err) {
              reject(err);
          });
      });

      req.on('error', function(e) {
        debug('PROBLEM WITH WEBREQUEST : ' + e.message); 
        reject(e);
      });

      req.end();
    });
    
  };

  return {
    callApi : callApi
  };

}();