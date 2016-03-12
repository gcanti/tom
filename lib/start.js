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
    .share()
    .startWith(initialState));

  var model$ = state$
    .pluck('model')
    .distinctUntilChanged();

  var view$ = model$
    .map(function (model) {
      return config.view(model, dispatch);
    })
    .filter(isNotNil);

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
    event$: event$,
    injectState$: injectState$,
    state$: state$,
    model$: model$,
    view$: view$,
    effect$: effect$
  };
}

module.exports = start;
