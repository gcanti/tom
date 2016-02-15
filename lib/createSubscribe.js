var t = require('tcomb');
var Observable = require('./Observable');

function createSubscribe(observable) {
  if (process.env.NODE_ENV !== 'production') {
    t.assert(Observable.is(observable), function () {
      return 'Invalid argument observable ' + t.stringify(observable) + ' supplied to createSubscribe(observable) (expected an Observable)';
    });
  }

  return function subscribe(listener) {
    if (process.env.NODE_ENV !== 'production') {
      t.assert(t.Function.is(listener), function () {
        return 'Invalid argument listener ' + t.stringify(listener) + ' supplied to subscribe(listener) (expected a function)';
      });
    }

    var subscription = observable.subscribe(listener);
    return function unsubscribe() {
      subscription.dispose();
    };
  };
}

module.exports = createSubscribe;