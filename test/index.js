var book = require('book');
var log = require('book').default();
var assert = require('assert');
var nock = require('nock');

var bugsnag = require('../');

test('setup', function() {
    var uri = 'https://notify.example.com/88af4eba6a79c858e6c75646ea2dd6fd885caa75';
    log.use(bugsnag()); // should be a no-op
    log.use(bugsnag(uri));
});

test('error', function(done) {
    var notify = nock('https://notify.example.com')
    .filteringRequestBody(function(body) {
        body = JSON.parse(body);
        assert.equal(body.apiKey, '88af4eba6a79c858e6c75646ea2dd6fd885caa75');
    })
    .post('/')
    .reply(200);

    log.error(new Error('test'));

    setTimeout(function() {
        notify.done();
        done();
    }, 10);
});

test('should support setting the release stage', function(done) {
    var log = book.default();

    var uri = 'https://notify.example.com/88af4eba6a79c858e6c75646ea2dd6fd885caa75?releaseStage=testing';
    log.use(bugsnag(uri));

    var notify = nock('https://notify.example.com')
    .filteringRequestBody(function(body) {
        body = JSON.parse(body);
        assert.equal(body.events.length, 1);

        var event = body.events.shift();
        assert.equal(event.releaseStage, 'testing');
        assert.equal(event.severity, 'error');
    })
    .post('/')
    .reply(200);

    log.error(new Error('test'));

    setTimeout(function() {
        notify.done();
        done();
    }, 10);
});
