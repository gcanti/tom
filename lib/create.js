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

  store.types = {
    State: State,
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

  store.streams.model$ = model$;

  store.getModel = function getModel() {
    return store.getState().model;
  };

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

  store.isRunning = function isRunning() {
    return !t.Nil.is(subscription);
  };

  store.runEffects = function runEffects() {
    if (process.env.NODE_ENV !== 'production') {
      t.assert(!store.isRunning(), 'You may not call runEffects(), this store is already running');
    }
    subscription = io$$
      .mergeAll() // flattens the metastream
      .filter(function (effect) {
        return !t.Nil.is(effect);
      })
      .subscribe(store.dispatch);
  };

  store.stopEffects = function stopEffects() {
    subscription.dispose();
    subscription = null;
  };

  return store;
}

module.exports = create;