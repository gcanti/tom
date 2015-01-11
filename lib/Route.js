'use strict';

var t = require('tcomb');
var Method = require('./Method');

var Params = t.dict(t.Str, t.Type, 'Params');

var Route = t.struct({
  method: Method,
  path: t.Str,
  handler: t.Func,
  name: t.maybe(t.Str),
  params: t.maybe(Params)
}, 'Route');

module.exports = Route;