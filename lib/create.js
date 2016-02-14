var t = require('tcomb');
var createReducer = require('./createReducer');
var createStore = require('./createStore');
var createSubscribe = require('./createSubscribe');

function comparer(a, b) {
  return a === b;
}

function create(Model, Event, Effect, initialState) {
  if (process.env.NODE_ENV !== 'production') {
    t.assert(t.isType(Effect), function () {
      return 'Invalid argument Effect ' + t.stringify(Effect) + ' supplied to create(Model, Event, Effect, initialState) (expected a type)';
    });
  }

  var State = t.struct({
    model: Model,
    effect: t.maybe(Effect)
  }, 'State');

  var reducer = createReducer(State, Event);

  var store = createStore(reducer, State(initialState));

  //
  // store types
  //

  store.types = {
    Model: Model,
    Event: Event,
    Effect: Effect
  };

  //
  // handle model
  //

  var model$ = store.streams.state$
    .pluck('model')
    .distinctUntilChanged(null, comparer);

  function getModel() {
    return store.getState().model;
  }

  store.streams.model$ = model$;
  store.getModel = getModel;
  store.subscribe = createSubscribe(model$);

  //
  // effect streams
  //

  var effect$ = store.streams.state$
    .pluck('effect')
    .filter(function (effect) {
      return !t.Nil.is(effect);
    });

  var io$$ = effect$
    .map(function(effect) {
      return effect.toObservable(store);
    });

  store.streams.effect$ = effect$;
  store.streams.io$$ = io$$;

  //
  // handle effects
  //

  var subscription = null;

  function run() {
    if (process.env.NODE_ENV !== 'production') {
      t.assert(!isRunning(), 'You may not call run(), the store is already running');
    }
    subscription = io$$
      .mergeAll() // flattens the metastream
      .filter(function (effect) {
        return !t.Nil.is(effect);
      })
      .subscribe(store.dispatch);
  }

  function isRunning() {
    return !t.Nil.is(subscription);
  }

  function stop() {
    subscription.dispose();
    subscription = null;
  }

  // consume effects right away
  run();

  store.run = run;
  store.isRunning = isRunning;
  store.stop = stop;

  return store;
}

module.exports = create;