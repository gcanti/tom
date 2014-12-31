'use strict';

var t = require('tcomb');
var Method = require('./Method');

var Layer = t.struct({
  method: Method,
  path: t.Str,
  handler: t.Func,
  name: t.maybe(t.Str),
  options: t.maybe(t.Obj),
  regexp: t.Re
}, 'Layer');

module.exports = Layer;