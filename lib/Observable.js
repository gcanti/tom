var t = require('tcomb');
var Rx = require('rx');

module.exports = t.irreducible('Observable', function (x) {
  return x instanceof Rx.Observable;
});