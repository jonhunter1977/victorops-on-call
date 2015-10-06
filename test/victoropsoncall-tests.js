var expect = require('expect.js');
var originalMoment = require('moment');
var proxyquire = require('proxyquire');
var currentTime;
var victoropsoncall = proxyquire('../victoropsoncall.js', {
    'moment': function() {
        var args = Array.prototype.slice.call(arguments);

        if (args.length) {
            return originalMoment.apply(undefined, args);
        }

        return originalMoment(currentTime)
    }
});
var Promise = require("bluebird");
var _ = require('lodash');

var mockApi = {
    getOnCallRotaForAllTeams: function(testFile) {
        return require('./data/' + (testFile || 'oncall') + '.json');
    },
    getOnCallRotaForTeam: function(teamName, testFile) {
        var teamOnCallData = _.find(require('./data/' + (testFile || 'oncall') + '.json'), {
            "name": teamName
        });
        return teamOnCallData;
    }
};

describe('Victor-Ops', function() {
    beforeEach(function() {
        currentTime = undefined;
    });

    describe('getPersonOnCallForTeam', function() {
        it('Should return ssunkari on support for the Application Support team', function() {
            var teamName = 'Application Support'
            var organisationOnCallData = mockApi.getOnCallRotaForAllTeams();

            return victoropsoncall.getPersonOnCallForTeam(organisationOnCallData, teamName).then(function(data) {
                expect(data).to.be('ssunkari');
            }).catch(function(err) {
                expect().fail(err);
            });
        });

        it('Should return no data if the group is not found', function() {
            var teamName = 'A Non Existant Group'
            var organisationOnCallData = mockApi.getOnCallRotaForAllTeams();

            return victoropsoncall.getPersonOnCallForTeam(organisationOnCallData, teamName).then(function(data) {
                expect().fail(data);
            }).catch(function(err) {
                expect(err).to.be('no data found for team : ' + teamName);
            });
        });
    });

    describe.only('getOnCallRotationForAllTeams', function() {
        describe('for a single team', function() {
            it('Sets currently on call', function(done) {
                var organisationOnCallData = mockApi.getOnCallRotaForAllTeams('singleteam');

                return victoropsoncall.getOnCallRotationForAllTeams(organisationOnCallData).then(function(data) {
                    expect(data.teams['Application Support'].current).to.eql('ssunkari');
                    done();
                }).catch(function(err) {
                    expect().fail(err);
                    done();
                });
            });

            it('Sets schedule for future shifts', function(done) {
                var organisationOnCallData = mockApi.getOnCallRotaForAllTeams('singleteam');

                return victoropsoncall.getOnCallRotationForAllTeams(organisationOnCallData).then(function(data) {
                    expect(data.teams['Application Support'].schedule).to.eql([{
                        "start": '2015-09-07T08:00:00+00:00',
                        "end": '2015-09-14T08:00:00+00:00',
                        "oncall": "ssunkari"
                    }, {
                        "start": '2015-09-14T08:00:00+00:00',
                        "end": '2015-09-21T08:00:00+00:00',
                        "oncall": "steveelliott"
                    }, {
                        "start": '2015-09-21T08:00:00+00:00',
                        "end": '2015-09-28T08:00:00+00:00',
                        "oncall": "jryan"
                    }]);
                    done();
                }).catch(function(err) {
                    expect().fail(err);
                    done();
                });
            });

            it('Sets complex schedule for future shifts', function(done) {
                var organisationOnCallData = mockApi.getOnCallRotaForAllTeams('singleteam-dutymanager');

                return victoropsoncall.getOnCallRotationForAllTeams(organisationOnCallData).then(function(data) {
                    expect(data.teams['Duty Management'].schedule).to.eql([{
                        oncall: 'djwilliamslr',
                        start: '2015-10-03T07:00:00+00:00',
                        end: '2015-10-05T07:00:00+00:00'
                    }, {
                        oncall: 'dguy',
                        start: '2015-10-05T17:00:00+00:00',
                        end: '2015-10-06T07:00:00+00:00'
                    }, {
                        oncall: 'itservicedesk',
                        start: '2015-10-06T07:00:00+00:00',
                        end: '2015-10-06T17:00:00+00:00'
                    }, {
                        oncall: 'dguy',
                        start: '2015-10-06T17:00:00+00:00',
                        end: '2015-10-07T07:00:00+00:00'
                    }, {
                        oncall: 'itservicedesk',
                        start: '2015-10-07T07:00:00+00:00',
                        end: '2015-10-07T17:00:00+00:00'
                    }, {
                        oncall: 'dguy',
                        start: '2015-10-07T17:00:00+00:00',
                        end: '2015-10-08T07:00:00+00:00'
                    }, {
                        oncall: 'itservicedesk',
                        start: '2015-10-08T07:00:00+00:00',
                        end: '2015-10-08T17:00:00+00:00'
                    }, {
                        oncall: 'dguy',
                        start: '2015-10-08T17:00:00+00:00',
                        end: '2015-10-09T07:00:00+00:00'
                    }, {
                        oncall: 'itservicedesk',
                        start: '2015-10-09T07:00:00+00:00',
                        end: '2015-10-09T17:00:00+00:00'
                    }, {
                        oncall: 'dguy',
                        start: '2015-10-09T17:00:00+00:00',
                        end: '2015-10-12T07:00:00+00:00'
                    }, {
                        oncall: 'itservicedesk',
                        start: '2015-10-12T07:00:00+00:00',
                        end: '2015-10-12T17:00:00+00:00'
                    }, {
                        oncall: 'trabbani',
                        start: '2015-10-12T17:00:00+00:00',
                        end: '2015-10-13T07:00:00+00:00'
                    }, {
                        oncall: 'itservicedesk',
                        start: '2015-10-13T07:00:00+00:00',
                        end: '2015-10-13T17:00:00+00:00'
                    }, {
                        oncall: 'trabbani',
                        start: '2015-10-13T17:00:00+00:00',
                        end: '2015-10-14T07:00:00+00:00'
                    }, {
                        oncall: 'itservicedesk',
                        start: '2015-10-14T07:00:00+00:00',
                        end: '2015-10-14T17:00:00+00:00'
                    }, {
                        oncall: 'trabbani',
                        start: '2015-10-14T17:00:00+00:00',
                        end: '2015-10-15T07:00:00+00:00'
                    }, {
                        oncall: 'itservicedesk',
                        start: '2015-10-15T07:00:00+00:00',
                        end: '2015-10-15T17:00:00+00:00'
                    }, {
                        oncall: 'trabbani',
                        start: '2015-10-15T17:00:00+00:00',
                        end: '2015-10-16T07:00:00+00:00'
                    }, {
                        oncall: 'itservicedesk',
                        start: '2015-10-16T07:00:00+00:00',
                        end: '2015-10-16T17:00:00+00:00'
                    }, {
                        oncall: 'trabbani',
                        start: '2015-10-16T17:00:00+00:00',
                        end: '2015-10-19T07:00:00+00:00'
                    }, {
                        oncall: 'itservicedesk',
                        start: '2015-10-19T07:00:00+00:00',
                        end: '2015-10-19T17:00:00+00:00'
                    }, {
                        oncall: 'djwilliamslr',
                        start: '2015-10-19T17:00:00+00:00',
                        end: '2015-10-20T07:00:00+00:00'
                    }, {
                        oncall: 'itservicedesk',
                        start: '2015-10-20T07:00:00+00:00',
                        end: '2015-10-20T17:00:00+00:00'
                    }, {
                        oncall: 'djwilliamslr',
                        start: '2015-10-20T17:00:00+00:00',
                        end: '2015-10-21T07:00:00+00:00'
                    }, {
                        oncall: 'itservicedesk',
                        start: '2015-10-21T07:00:00+00:00',
                        end: '2015-10-21T17:00:00+00:00'
                    }, {
                        oncall: 'djwilliamslr',
                        start: '2015-10-21T17:00:00+00:00',
                        end: '2015-10-22T07:00:00+00:00'
                    }, {
                        oncall: 'itservicedesk',
                        start: '2015-10-22T07:00:00+00:00',
                        end: '2015-10-22T17:00:00+00:00'
                    }, {
                        oncall: 'djwilliamslr',
                        start: '2015-10-22T17:00:00+00:00',
                        end: '2015-10-23T07:00:00+00:00'
                    }, {
                        oncall: 'itservicedesk',
                        start: '2015-10-23T07:00:00+00:00',
                        end: '2015-10-23T17:00:00+00:00'
                    }, {
                        oncall: 'djwilliamslr',
                        start: '2015-10-23T17:00:00+00:00',
                        end: '2015-10-24T07:00:00+00:00'
                    }, {
                        oncall: 'itservicedesk',
                        start: '2015-10-26T08:00:00+00:00',
                        end: '2015-10-26T18:00:00+00:00'
                    }]);
                    done();
                }).catch(function(err) {
                    expect().fail(err);
                    done();
                });
            });
        });
    });

    describe('getPeopleOnCallForAllTeams', function() {
        it('Should return the correct on call data for all teams', function() {
            var organisationOnCallData = mockApi.getOnCallRotaForAllTeams();

            return victoropsoncall.getPeopleOnCallForAllTeams(organisationOnCallData).then(function(data) {

                var expectedData = {
                    "oncall": [{
                        "team": "Application Support",
                        "oncall": "ssunkari"
                    }, {
                        "team": "System Support",
                        "oncall": "pcrombie"
                    }, {
                        "team": "Database Support",
                        "oncall": "mrkashif"
                    }, {
                        "team": "Duty Management",
                        "oncall": "itservicedesk"
                    }]
                };

                expect(data).to.eql(expectedData);
            }).catch(function(err) {
                expect().fail(err);
            });
        });

        it('Should return pcrombie on support for System Support', function() {
            var organisationOnCallData = mockApi.getOnCallRotaForAllTeams();

            return victoropsoncall.getPeopleOnCallForAllTeams(organisationOnCallData).then(function(data) {
                expect(data.oncall[1].oncall).to.eql('pcrombie');
            }).catch(function(err) {
                expect().fail(err);
            });
        });

        it('Should return mrkashif on support for Database Support', function() {
            var organisationOnCallData = mockApi.getOnCallRotaForAllTeams();

            return victoropsoncall.getPeopleOnCallForAllTeams(organisationOnCallData).then(function(data) {

                var expectedData = {
                    "oncall": [{
                        "team": "Application Support",
                        "oncall": "ssunkari"
                    }, {
                        "team": "System Support",
                        "oncall": "pcrombie"
                    }, {
                        "team": "Database Support",
                        "oncall": "mrkashif"
                    }, {
                        "team": "Duty Management",
                        "oncall": "itservicedesk"
                    }]
                };

                expect(data.oncall[2].oncall).to.eql('mrkashif');
            }).catch(function(err) {
                expect().fail(err);
            });
        });

        describe('Should override on support for Duty Management', function() {
            it('current date within bounds of override', function() {
                currentTime = 1442854800000;

                var organisationOnCallData = mockApi.getOnCallRotaForAllTeams();

                return victoropsoncall.getPeopleOnCallForAllTeams(organisationOnCallData).then(function(data) {
                    expect(data.oncall[3].oncall).to.eql('djwilliamslr');
                }).catch(function(err) {
                    expect().fail(err);
                });
            });
        });

        it('If no data is passed then it will error', function() {
            var organisationOnCallData = '';

            return victoropsoncall.getPeopleOnCallForAllTeams(organisationOnCallData).then(function(data) {
                expect().fail(data);
            }).catch(function(err) {
                expect(err).to.be('no oncall data was passed');
            });
        });

        it('If null is passed then it will error', function() {
            var organisationOnCallData = null;

            return victoropsoncall.getPeopleOnCallForAllTeams(organisationOnCallData).then(function(data) {
                expect().fail(data);
            }).catch(function(err) {
                expect(err).to.be('no oncall data was passed');
            });
        });

        it('If a a blank array is passed it will error', function() {
            var organisationOnCallData = [];

            return victoropsoncall.getPeopleOnCallForAllTeams(organisationOnCallData).then(function(data) {
                expect().fail(data);
            }).catch(function(err) {
                expect(err).to.be('No oncall data found for any teams');
            });
        });
    });

    describe('checkIfRotaHasChanged', function() {
        it('Should return true if a person on call has changed', function() {

            var oldRota = {
                "oncall": [{
                    "team": "Application Support",
                    "oncall": "ssunkari"
                }, {
                    "team": "System Support",
                    "oncall": "pcrombie"
                }, {
                    "team": "Database Support",
                    "oncall": "mrkashif"
                }, {
                    "team": "Duty Management",
                    "oncall": "itservicedesk"
                }]
            };

            var newRota = {
                "oncall": [{
                    "team": "Application Support",
                    "oncall": "steveelliott"
                }, {
                    "team": "System Support",
                    "oncall": "pcrombie"
                }, {
                    "team": "Database Support",
                    "oncall": "mrkashif"
                }, {
                    "team": "Duty Management",
                    "oncall": "itservicedesk"
                }]
            };

            return victoropsoncall.hasRotaChanged(oldRota.oncall, newRota.oncall).then(function(data) {
                expect(data).to.eql(true);
            }).catch(function(err) {
                expect().fail(err);
            });
        });

        it('Should return false if the rota has not changed', function() {

            var oldRota = {
                "oncall": [{
                    "team": "Application Support",
                    "oncall": "ssunkari"
                }, {
                    "team": "System Support",
                    "oncall": "pcrombie"
                }, {
                    "team": "Database Support",
                    "oncall": "mrkashif"
                }, {
                    "team": "Duty Management",
                    "oncall": "itservicedesk"
                }]
            };

            var newRota = {
                "oncall": [{
                    "team": "Application Support",
                    "oncall": "ssunkari"
                }, {
                    "team": "System Support",
                    "oncall": "pcrombie"
                }, {
                    "team": "Database Support",
                    "oncall": "mrkashif"
                }, {
                    "team": "Duty Management",
                    "oncall": "itservicedesk"
                }]
            };

            return victoropsoncall.hasRotaChanged(oldRota.oncall, newRota.oncall).then(function(data) {
                expect(data).to.eql(false);
            }).catch(function(err) {
                expect().fail(err);
            });
        });

        it('Should return an error if one of the rotas has no data', function() {

            var oldRota = {
                "oncall": [{
                    "team": "Application Support",
                    "oncall": "ssunkari"
                }, {
                    "team": "System Support",
                    "oncall": "pcrombie"
                }, {
                    "team": "Database Support",
                    "oncall": "mrkashif"
                }, {
                    "team": "Duty Management",
                    "oncall": "itservicedesk"
                }]
            };

            var newRota;

            return victoropsoncall.hasRotaChanged(oldRota.oncall, newRota).then(function(data) {
                expect().fail(data);
            }).catch(function(err) {
                expect(err).to.be('some or all rota data was not supplied');
            });
        });

        it('Should return an error if both of the rotas have no data', function() {

            var oldRota;
            var newRota;

            return victoropsoncall.hasRotaChanged(oldRota, newRota).then(function(data) {
                expect().fail(data);
            }).catch(function(err) {
                expect(err).to.be('some or all rota data was not supplied');
            });
        });

        it('Should return an error if both of the rotas are blank strings', function() {

            var oldRota = '';
            var newRota = '';

            return victoropsoncall.hasRotaChanged(oldRota, newRota).then(function(data) {
                expect().fail(data);
            }).catch(function(err) {
                expect(err).to.be('some or all rota data was not supplied');
            });
        });

        it('Should return an error if both of the rotas are blank arrays', function() {

            var oldRota = {
                "oncall": []
            };
            var newRota = {
                "oncall": []
            };

            return victoropsoncall.hasRotaChanged(oldRota.oncall, newRota.oncall).then(function(data) {
                expect().fail(data);
            }).catch(function(err) {
                expect(err).to.be('some or all rota data was not supplied');
            });
        });
    });
});
