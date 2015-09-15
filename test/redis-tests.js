var debug = require('debug')('victor-ops-on-call:redis-tests');
var expect = require('expect.js');
var redis = require('../redis.js');

var testRota = { "oncall" : []};
testRota.oncall.push({"team" : "Application Support","oncall" : "ssunkari"});
testRota.oncall.push({"team" : "System Support","oncall" : "pcrombie"});
testRota.oncall.push({"team" : "Database Support","oncall" : "mrkashif"});
testRota.oncall.push({"team" : "Duty Management","oncall" : "itservicedesk"});

var updatedTestRota = { "oncall" : []};
testRota.oncall.push({"team" : "Application Support","oncall" : "selliot"});
testRota.oncall.push({"team" : "System Support","oncall" : "jhunter"});
testRota.oncall.push({"team" : "Database Support","oncall" : "mrkashif"});
testRota.oncall.push({"team" : "Duty Management","oncall" : "itservicedesk"});

describe('Redis', function () {

    describe('set hash', function () {
        it('Should set the hash value', function () {
            var hash = 'oncallrota';
            return redis.setHash(hash, {"oncall" : JSON.stringify(testRota.oncall)}).then(function(data){
                expect(data).to.be('OK');
            }).catch(function(err){
                expect().fail(err);
            });
        });
    });

    describe('get hash', function () {
        it('Should return null if hash is not passed', function () {
            return redis.getHash().then(function(data){
                expect(data).to.be(null);
            }).catch(function(err){
                expect().fail(err);
            });
        });

        it('Should return null if hash does not exist', function () {
            return redis.getHash('testhash').then(function(data){
                expect(data).to.be(null);
            }).catch(function(err){
                expect().fail(err);
            });
        });
    });

    describe('delete hash', function () {
        it('Should return OK if the hash is deleted', function () {
            var hash = 'test-delete-hash';
            return redis.setHash(hash, {"data" : "test"}).then(function(data){
                expect(data).to.be('OK');
                return redis.deleteHash(hash);
            }).then(function(data){
                expect(data).to.be(1);
                return redis.getHash(hash);
            }).then(function(data){
                expect(data).to.be(null);
            }).catch(function(err){
                expect().fail(err);
            });
        });
    });    

    describe('get and set hash', function () {

        before(function() {
            redis.deleteHash('oncallrota');
        });

        it('Should set the hash value', function () {
            var hash = 'oncallrota';
            return redis.setHash(hash, {"oncall" : JSON.stringify(testRota.oncall)}).then(function(data){
                expect(data).to.be('OK');
                return redis.getHash(hash);
            }).then(function(data){
                expect(JSON.parse(data.oncall)).to.eql(testRota.oncall);
            }).catch(function(err){
                expect().fail(err);
            });
        });
    });

    describe('set and update hash', function () {

        before(function() {
            redis.deleteHash('oncallrota');
        });

        it('Should set the hash value and then update it with a new value', function () {
            var hash = 'oncallrota';
            return redis.setHash(hash, {"oncall" : JSON.stringify(testRota.oncall)}).then(function(data){
                expect(data).to.be('OK');
                return redis.setHash(hash, {"oncall" : JSON.stringify(updatedTestRota.oncall)});
            }).then(function(data){
                expect(data).to.be('OK');
                return redis.getHash(hash);
            }).then(function(data){
                expect(JSON.parse(data.oncall)).to.eql(updatedTestRota.oncall);
            }).catch(function(err){
                expect().fail(err);
            });
        });
    });
});
