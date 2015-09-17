var webRequest;
var config = require('./config/index');
var debug = require('debug')('victor-ops-on-call:webrequest');
var Promise = require("bluebird");

var isApiSecure = config.get('victorOpsApi:isSecure');

if(isApiSecure) {
    webRequest = require('https');
    debug(new Date(), 'HTTPS will be used for API calls');
} 
else {
    webRequest = require('http');
    debug(new Date(), 'HTTP will be used for API calls');
}

module.exports = function(){

  var callApi = function(options){ 
    
    return new Promise(function(resolve, reject){
      
      var reqData = '';

      debug(new Date(), options);

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
        debug(new Date(), 'Problem with webrequest : ' + e.message); 
        reject(e);
      });

      req.end();
    });
    
  };

  return {
    callApi : callApi
  };

}();