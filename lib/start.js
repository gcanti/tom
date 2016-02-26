var Rx = require('rx');

function isNotNil(x) {
  return x !== null && x !== undefined;
}

function start(config) {
  var event$ = new Rx.Subject();
  var readOnlyEvent$ = event$.asObservable();
  var injectState$ = new Rx.Subject(); // enables time travel

  function dispatch(event) {
    event$.onNext(event);
  }

  var initialState = config.init();
  var state$ = injectState$.merge(event$
    .scan(function (state, event) {
      return config.update(state.model, event);
    }, initialState)
    .startWith(initialState)
    .shareReplay(1));

  var model$ = state$
    .pluck('model')
    .distinctUntilChanged();

  var view$ = model$
    .map(function (model) {
      return config.view(model, dispatch);
    });

  var effect$ = state$
    .pluck('effect')
    .filter(isNotNil);

  // run effects
  effect$
    .map(function (effect) {
      return config.run(effect, readOnlyEvent$);
    })
    .filter(isNotNil)
    .mergeAll() // flattens the metastream
    // cycle
    .subscribe(dispatch);

  return {
    dispatch: dispatch,
    injectState$: injectState$,
    state$: state$,
    view$: view$
  };
}

module.exports = start;
