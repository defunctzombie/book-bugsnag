var log = require('book').default();
var assert = require('assert');
var nock = require('nock');

var bugsnag = require('../');

test('setup', function() {
    var uri = 'https://notify.example.com/88af4eba6a79c858e6c75646ea2dd6fd885caa75';
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

