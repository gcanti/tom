var Rx = require('rx');

function isNotNil(x) {
  return x !== null && x !== undefined;
}

function getStreams(config, event$) {
  var readOnlyEvent$ = event$.asObservable();

  function dispatch(event) {
    event$.onNext(event);
  }

  var initialState = config.init();
  var state$ = event$
    .scan(function (state, event) {
      return config.update(state.model, event);
    }, initialState)
    .startWith(initialState)
    .shareReplay(1);

  var model$ = state$
    .pluck('model')
    .distinctUntilChanged();

  var view$ = model$
    .map(function (model) {
      return config.view(model, dispatch);
    })
    .filter(isNotNil)
    .shareReplay(1);

  var effect$ = state$
    .pluck('effect')
    .filter(isNotNil);

  var nextEvent$$ = effect$
    .map(function (effect) {
      return config.run(effect, readOnlyEvent$);
    })
    .filter(isNotNil)
    .shareReplay(1);

  var nextEvent$ = nextEvent$$.mergeAll(); // flattens the metastream

  return {
    dispatch: dispatch,
    event$: event$,
    state$: state$,
    model$: model$,
    view$: view$,
    effect$: effect$,
    nextEvent$$: nextEvent$$,
    nextEvent$: nextEvent$
  };
}

function start(config) {
  var event$ = new Rx.Subject();
  var streams = getStreams(config, event$);
  // run effects
  streams.nextEvent$
    .delay(0) // process next events in the next tick
    .subscribe(function (event) {
      streams.event$.onNext(event);
    });
  return streams;
}

start.getStreams = getStreams;
module.exports = start;
