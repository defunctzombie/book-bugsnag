# book-bugsnag

bugsnag logger for book

```js
var log = require('book');

// BUGSNAG_URI should be of the form https://host/key
// i.e. https://notify.bugsnag.com/88af4eba6a79c858e6c75646ea2dd6fd885caa75
log.use(bugsnag('BUGSNAG_URI'));

// log an error and it will go to bugsnag
log.error(new Error('foobar'));
```

## Bugsnag config options

Additional bugsnag config options can be set via the query parameters.

```
https://notify.bugsnag.com/88af4eba6a79c858e6c75646ea2dd6fd885caa75?releaseStage=testing
```
