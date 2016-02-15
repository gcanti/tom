var t = require('tcomb');
var Rx = require('rx');

var ParallelEffect = t.struct({
  effects: t.list(t.Any)
}, 'ParallelEffect');

ParallelEffect.prototype.toObservable = function(store) {
  return Rx.Observable.merge(this.effects.map(function (effect) {
    return effect.toObservable(store);
  }));
};

module.exports = ParallelEffect;