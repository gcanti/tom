'use strict';

/*

  # Session

  The entire app state SHOULD be immutable and contained in one single place (see om) called *(user) session*.

  ```js
  var t = require('tcomb');
  var Session = require('tom/Session');

  // developers MUST define this
  var State = t.struct({
    ...
  });

  var session = new Session({
    State: State, // : Type, state constructor (required)
    initialState: {},    // : Obj, initial state (required)
    Patch: Patch, // : Type, patch constructor (optional)
    merge: ...    // : Func, patches merge strategy (optional)
  });
  ```

  ## Get the state

  ```js
  session.getState() -> State
  ```

  ## Update the state

  ```js
  // default constructor
  var Patch = t.struct({
    // the current state from the client POV
    token: t.maybe(State),
    // an acceptable argument for State.update
    spec: t.Obj
  });

  session.patch(patch: Patch, currentState: State) -> State
  ```

  - if `patch.token === currentState` the patch will be applied
  - if `merge` exists, will be called
  - throws an error

  ### merge(patch, currentState)

  Developers SHOULD implement:

  ```js
  merge(patch: Patch, currentState: State) -> State
  ```

  ## Listen to state changes

  ```js
  session.on('change', listener);
  session.off('change', listener);
  ```

*/

var t = require('tcomb');
var debug = require('debug')('Session');
var EventEmitter = require('eventemitter3');

function getDeafultPatch(State) {
  debug('using default `Patch` constructor');
  return t.struct({
    token: t.maybe(State),
    spec: t.Obj
  }, 'Patch');
}

function Session(opts) {

  var State = t.Type(opts.State);
  var Patch = t.maybe(t.Type)(opts.Patch) || getDeafultPatch(State);
  var merge = t.maybe(t.Func)(opts.merge);
  var emitter = new EventEmitter();

  // keep the state private
  var state = t.maybe(State)(opts.initialState);

  function getState() {
    return state;
  }

  function patch(patch) {

    patch = new Patch(patch);

    debug('patching %j', patch.spec);

    var nextState;
    if (patch.token === state) {
      nextState = State.update(state, patch.spec);
      debug('patch succeded');
    } else if (merge) {
      debug('merging');
      nextState = new State(merge(patch, state));
      debug('merge succeded');
    } else {
      throw new Error('patch failure: no merge algorithm specified');
    }

    if (nextState !== state) {
      state = nextState;
      emitter.emit('change', state);
    }

    return state;
  }

  Object.freeze({
    State: State,
    Patch: Patch,
    getState: getState,
    patch: patch,
    on: emitter.on.bind(emitter),
    off: emitter.off.bind(emitter)
  });
}

module.exports = Session;