var debug = require('debug')('victor-ops-on-call:victoropsoncall-tests');
var config = require('../config/index');
var expect = require('expect.js');
var victoropsoncall = require('../victoropsoncall.js');
var Promise = require("bluebird");
var testOnCallData = require('./data/oncall.json');
var _ = require('lodash');

var mockApi = {
    getOnCallRotaForAllTeams : function() {
        return testOnCallData;
    },
    getOnCallRotaForTeam : function(teamName) {
        var teamOnCallData =  _.find(testOnCallData, {"name" : teamName});
        return teamOnCallData;
    }
};

describe('Victor-Ops', function () {
    describe('getPersonOnCallForTeam', function () {
        it('Should return ssunkari on support for the Application Support team', function () {
            var teamName = 'Application Support'
            var organisationOnCallData = mockApi.getOnCallRotaForAllTeams();

            return victoropsoncall.getPersonOnCallForTeam(organisationOnCallData, teamName).then(function(data){
                expect(data).to.be('ssunkari');
            }).catch(function(err){
                expect().fail(err);
            });
        });

        it('Should return no data if the group is not found', function () {
            var teamName = 'A Non Existant Group'
            var organisationOnCallData = mockApi.getOnCallRotaForAllTeams();

            return victoropsoncall.getPersonOnCallForTeam(organisationOnCallData, teamName).then(function(data){
                expect().fail(data);
            }).catch(function(err){
                expect(err).to.be('no data found for team : ' + teamName);
            });
        });
    });

    describe('getPeopleOnCallForAllTeams', function () {
        it('Should return the correct on call data for all teams', function () {
            var organisationOnCallData = mockApi.getOnCallRotaForAllTeams();

            return victoropsoncall.getPeopleOnCallForAllTeams(organisationOnCallData).then(function(data){

                var expectedData = { "oncall" : [
                    {"team" : "Application Support","oncall" : "ssunkari"},
                    {"team" : "System Support","oncall" : "pcrombie"},
                    {"team" : "Database Support","oncall" : "mrkashif"},
                    {"team" : "Duty Management","oncall" : "itservicedesk"}
                ]};

                expect(data).to.eql(expectedData);
            }).catch(function(err){
                expect().fail(err);
            });
        });

        it('Should return pcrombie on support for System Support', function () {
            var organisationOnCallData = mockApi.getOnCallRotaForAllTeams();

            return victoropsoncall.getPeopleOnCallForAllTeams(organisationOnCallData).then(function(data){

                var expectedData = { "oncall" : [
                    {"team" : "Application Support","oncall" : "ssunkari"},
                    {"team" : "System Support","oncall" : "pcrombie"},
                    {"team" : "Database Support","oncall" : "mrkashif"},
                    {"team" : "Duty Management","oncall" : "itservicedesk"}
                ]};

                expect(data.oncall[1].oncall).to.eql('pcrombie');
            }).catch(function(err){
                expect().fail(err);
            });
        });

        it('Should return mrkashif on support for Database Support', function () {
            var organisationOnCallData = mockApi.getOnCallRotaForAllTeams();

            return victoropsoncall.getPeopleOnCallForAllTeams(organisationOnCallData).then(function(data){

                var expectedData = { "oncall" : [
                    {"team" : "Application Support","oncall" : "ssunkari"},
                    {"team" : "System Support","oncall" : "pcrombie"},
                    {"team" : "Database Support","oncall" : "mrkashif"},
                    {"team" : "Duty Management","oncall" : "itservicedesk"}
                ]};

                expect(data.oncall[2].oncall).to.eql('mrkashif');
            }).catch(function(err){
                expect().fail(err);
            });
        });        

        it('If no data is passed then it will error', function () {
            var organisationOnCallData = '';

            return victoropsoncall.getPeopleOnCallForAllTeams(organisationOnCallData).then(function(data){
                expect().fail(data);
            }).catch(function(err){
                expect(err).to.be('no oncall data was passed');
            });
        });

       it('If null is passed then it will error', function () {
            var organisationOnCallData = null;

            return victoropsoncall.getPeopleOnCallForAllTeams(organisationOnCallData).then(function(data){
                expect().fail(data);
            }).catch(function(err){
                expect(err).to.be('no oncall data was passed');
            });
        });        

        it('If a a blank array is passed it will error', function () {
            var organisationOnCallData = [];

            return victoropsoncall.getPeopleOnCallForAllTeams(organisationOnCallData).then(function(data){
                expect().fail(data);
            }).catch(function(err){
               expect(err).to.be('No oncall data found for any teams');
            });
        });
    });
});
