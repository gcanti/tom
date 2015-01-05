'use strict';

var t = require('tcomb');
var debug = require('debug')('Session');
var EventEmitter = require('eventemitter3');

function noop() {}

function getDeafultPatch(State) {
  debug('using default Patch');
  return t.struct({
    token: t.maybe(State),
    data: t.Obj
  }, 'Patch');
}

function Session(opts) {

  var State = t.Type(opts.State);
  var Patch = t.maybe(t.Type)(opts.Patch) || getDeafultPatch(State);
  var merge = t.maybe(t.Func)(opts.merge);
  var emitter = new EventEmitter();

  // keep the state private
  var state = t.maybe(State)(opts.state);

  function getState() {
    return state;
  }

  function patch(patch) {

    patch = new Patch(patch);

    debug('patching');

    if (patch.token === state) {
      state = State.update(state, patch.data);
      debug('patch succeded');
    } else if (merge) {
      debug('merging');
      state = new State(merge(patch, state));
      debug('merge succeded');
    } else {
      throw new Error('patch failed: no merge algorithm specified');
    }

    emitter.emit('change', state);
    return state;
  }

  return Object.freeze({
    State: State,
    Patch: Patch,
    getState: getState,
    patch: patch,
    on: emitter.on.bind(emitter),
    off: emitter.on.bind(emitter),
    once: emitter.on.bind(emitter)
  });
}

module.exports = Session;