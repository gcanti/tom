var t = require('tcomb');
var Rx = require('rx');

var HashHistoryEffect = t.struct({
  path: t.String
}, 'HashHistoryEffect');

HashHistoryEffect.prototype.toObservable = function() {
  var path = this.path;

  return Rx.Observable.create(function (observer) {
    function onHashChange() {
      window.removeEventListener('hashchange', onHashChange);
      observer.onCompleted();
    }
    window.addEventListener('hashchange', onHashChange);
    location.hash = '#' + path;
  });
};

module.exports = HashHistoryEffect;