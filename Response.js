'use strict';

var t = require('tcomb');

var Response = t.struct({
  flush: t.Func,
  redirect: t.Func,
  render: t.Func
}, 'Response');

module.exports = Response;