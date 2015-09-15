var debug = require('debug')('victor-ops-on-call:notifier-tests');
var expect = require('expect.js');
var notifiers = require('../notifiers.js');
var notifier = require('../notifiers/testNotifier.js');

describe('Notifier', function () {

    describe('Register notifier', function () {
        it('Should register a module as a notifier', function () {
            expect(notifiers.registerNotifier).withArgs(notifier).to.not.throwException();
        });
    });

    describe('Run notifier', function () {
        it('Should run the notification for the module', function () {
            notifiers.clearAllNotifiers();
            notifiers.registerNotifier(notifier);
            expect(notifiers.runAllNotifiers).to.not.throwException();
        });
    });

});