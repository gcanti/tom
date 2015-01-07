'use strict';

var t = require('tcomb');
var debug = require('debug')('Router');
var Request = require('./Request');
var Response = require('./Response');
var Method = require('./Method');
var pathToRegexp = require('path-to-regexp');
var Context = require('./Context');

function getParams(match, keys) {
  var params = {};
  for (var i = 0, len = keys.length ; i < len ; i++) {
    var key = keys[i];
    var param = match[i + 1];
    if (!param) { continue; }
    params[key.name] = decodeURIComponent(param);
    if (key.repeat) {
      params[key.name] = params[key.name].split(key.delimiter);
    }
  }
  return params;
}

var Route = t.struct({
  method: Method,
  path: t.Str,
  handler: t.Func
}, 'Route');

function Layer(method, path, handler, options) {
  this.method = method;
  this.path = path;
  this.handler = handler;
  this.regexp = pathToRegexp(path, this.keys = [], options);
}

function Router() {
  this.layers = {};
}

Router.prototype.define = function(route) {
  route = new Route(route);
  debug('adding route `%s %s`', route.method, route.path);
  this.layers[route.method] = this.layers[route.method] || [];
  this.layers[route.method].push(new Layer(route.method, route.path, route.handler));
  return this;
};

Router.prototype.get = function(path, handler) {
  return this.define({
    method: 'GET',
    path: path,
    handler: handler
  });
};

Router.prototype.post = function(path, handler) {
  return this.define({
    method: 'POST',
    path: path,
    handler: handler
  });
};

Router.prototype.dispatch = function(req, res) {

  req = new Request(req);
  res = new Response(res);

  debug('dispatching `%s %s`', req.method, req.url);
  var layers = this.layers[req.method].slice();
  debug('%s candidate layer(s) found', layers.length);

  var ctx = new Context(req, res, next);

  function next() {
    if (!layers.length) {
      throw new Error(t.util.format('Match not found for `%s %s`', req.method, req.path));
    }
    var layer = layers.shift();
    var match = layer.regexp.exec(req.path);
    if (!match) {
      return next();
    }
    debug('match found: `%s %s`', layer.method, layer.path);
    ctx.params = getParams(match, layer.keys);
    layer.handler(ctx);
  }

  next();

  return this;
};

module.exports = Router;