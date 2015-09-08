var debug = require('debug')('victor-ops-on-call:tests');
var config = require('../config/index');
var expect = require('expect.js');
var victoropsoncall = require('../victoropsoncall.js');
var Promise = require("bluebird");
var testOnCallData = require('./data/oncall.json');

describe('Victor-Ops', function () {
    describe('getPersonOnCallForGroup', function () {
        it('Should return ssunkari on support for the application-support group', function () {
            var group = 'Application Support'

            return victoropsoncall.getPersonOnCallForGroup(testOnCallData, group).then(function(data){
                expect(data).to.be('ssunkari');
            }).catch(function(err){
                expect().fail(err);
            });
        });

        it('Should return no data if the group is not found', function () {
            var group = 'A Non Existant Group'

            return victoropsoncall.getPersonOnCallForGroup(testOnCallData, group).then(function(data){
                expect().fail(data);
            }).catch(function(err){
                expect(err).to.be('no data found for group : ' + group);
                
            });
        });
    });
});
