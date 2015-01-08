'use strict';

var t = require('tcomb');
var Method = require('./Method');
var parse = require('url').parse;
var querystring = require('querystring');

var Request = t.struct({
  method: Method,
  url: t.Str,
  path: t.Str,
  query: t.Obj,
  body: t.maybe(t.Obj)
}, 'Request');

Request.of = function (method, url, body) {
  var parsed = parse(url);
  return new Request({
    method: method,
    url: url,
    path: parsed.pathname,
    query: querystring.parse(parsed.query),
    body: body
  });
};

module.exports = Request;