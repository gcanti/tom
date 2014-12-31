'use strict';

var t = require('tcomb');
var Method = require('./Method');

var RequestEvent = t.struct({
  method: Method,
  url: t.Str,
  body: t.maybe(t.Obj)
}, 'RequestEvent');

module.exports = RequestEvent;