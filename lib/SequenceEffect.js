var t = require('tcomb');
var Rx = require('rx');

var SequenceEffect = t.struct({
  effects: t.list(t.Any)
}, 'SequenceEffect');

SequenceEffect.prototype.toObservable = function(store) {
  return Rx.Observable.concat(this.effects.map(function (effect) {
    return effect.toObservable(store);
  }));
};

module.exports = SequenceEffect