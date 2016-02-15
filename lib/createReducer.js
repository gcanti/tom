var t = require('tcomb');

function createReducer(State, Event) {
  if (process.env.NODE_ENV !== 'production') {
    t.assert(t.isType(State), function () {
      return 'Invalid argument State ' + t.stringify(State) + ' supplied to createReducer(State, Event) (expected a type)';
    });
    t.assert(t.isType(Event), function () {
      return 'Invalid argument Event ' + t.stringify(Event) + ' supplied to createReducer(State, Event) (expected a type)';
    });
  }

  return function reducer(state, event) {
    if (process.env.NODE_ENV !== 'production') {
      t.assert(State.is(State(state)) && State.is(state), function () {
        return 'Invalid argument state ' + t.stringify(state) + ' supplied to reducer(state, event) (expected a ' + t.getTypeName(State) + ')';
      });
      t.assert(Event.is(Event(event)) && Event.is(event), function () {
        return 'Invalid argument event ' + t.stringify(state) + ' supplied to reducer(state, event) (expected a ' + t.getTypeName(Event) + ')';
      });
    }

    if (t.Function.is(event.toPatch)) {
      var patch = event.toPatch(state);
      if (process.env.NODE_ENV !== 'production') {
        t.assert(t.Object.is(patch), function () {
          return 'Invalid patch returned by ' + t.getTypeName(event.constructor) + ' (expected an object)';
        });
      }
      // by default the previous effect is removed
      if (!patch.hasOwnProperty('effect')) {
        patch.effect = { $set: null };
      }
      return State.update(state, patch);
    }
    return State(event.update(state));
  };
}

module.exports = createReducer;