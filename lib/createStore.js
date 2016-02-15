var t = require('tcomb');
var Rx = require('rx');

function createStore(reducer, initialState) {
  if (process.env.NODE_ENV !== 'production') {
    t.assert(t.Function.is(reducer), function () {
      return 'Invalid argument reducer ' + t.stringify(reducer) + ' supplied to createStore(reducer, initialState) (expected a function)';
    });
  }

  var currentState = initialState;
  var event$ = new Rx.Subject();
  var state$ = event$
    .scan(reducer, initialState)
    .shareReplay(1);

  state$.subscribe(function (nextState) {
    currentState = nextState;
  });

  function dispatch(event) {
    event$.onNext(event);
  }

  function getState() {
    return currentState;
  }

  return {
    streams: {
      event$: event$,
      state$: state$
    },
    dispatch: dispatch,
    getState: getState
  };
}

module.exports = createStore;