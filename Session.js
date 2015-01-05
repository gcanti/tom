'use strict';

var t = require('tcomb');
var debug = require('debug')('Session');
var EventEmitter = require('eventemitter3');

function noop() {}

function getDeafultPatch(State) {
  debug('using default Patch');
  return t.struct({
    state: t.maybe(State),
    data: t.Obj
  }, 'Patch');
}

function Session(opts) {

  var State = t.Type(opts.State);
  var Patch = t.maybe(t.Type)(opts.Patch) || getDeafultPatch(State);
  var state = t.maybe(State)(opts.state); // keep the state private
  var merge = t.maybe(t.Func)(opts.merge);
  var ee = new EventEmitter();

  function getState() {
    return state;
  }

  function patch(patch, callback) {

    patch = new Patch(patch);
    callback = t.maybe(t.Func)(callback) || noop;

    debug('patching %j', patch.data);

    if (patch.state === state) {

      state = State.update(state, patch.data);
      debug('patch succeded');
      callback(null, state);
      ee.emit('change', state);

    } else if (merge) {

      debug('calling merge algorithm');
      merge(patch, state, function (err, newState) {
        if (err) {
          debug('merge failed');
          callback(err);
          ee.emit('error', err);
        } else {
          state = new State(newState);
          debug('merge succeded');
          callback(null, state);
          ee.emit('change', state);
        }
      });

    } else {

      debug('patch failed: no merge algorithm specified');
      var err = new Error('invalid state');
      err.patch = patch;
      err.state = state;
      callback(err);
      ee.emit('error', err);

    }
  }

  return Object.freeze({
    State: State,
    Patch: Patch,
    getState: getState,
    patch: patch,
    on: ee.on.bind(ee),
    off: ee.on.bind(ee),
    once: ee.on.bind(ee)
  });
}

module.exports = Session;