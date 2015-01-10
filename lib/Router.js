'use strict';

var t = require('tcomb');
var debug = require('debug')('Router');
var Method = require('./Method');
var Request = require('./Request');
var EventEmitter = require('eventemitter3');

var Params = t.dict(t.Str, t.Type, 'Params');

var Route = t.struct({
  method: Method,
  path: t.Str,
  handler: t.Func,
  name: t.maybe(t.Str),
  params: t.maybe(Params)
}, 'Route');

var Layer = t.struct({
  route: Route,
  match: t.Func
}, 'Layer');

function Context(req, next) {
  this.req = new Request(req);
  this.next = next;
  this.params = {};
}

function Router(matcher) {
  this.matcher = matcher;
  this.layers = {};
  this.emitter = new EventEmitter();
}

Router.prototype.route = function (route) {

  route = new Route(route);

  debug('defining %s', route + '');
  var layers = this.layers[route.method] = this.layers[route.method] || [];
  layers.push(new Layer({
    route: route,
    match: this.matcher(route.path)
  }));

  return this;
};

Router.prototype.getLayers = function(method) {
  return this.layers[method] ? this.layers[method].slice() : [];
};

Router.prototype.dispatch = function(req) {

  req = new Request(req);

  debug('dispatching %s', req + '');
  this.emitter.emit('dispatch', req);
  var layers = this.getLayers(req.method);
  debug('  %s layer(s) found', layers.length);

  var self = this;
  var ctx = new Context(req, next);

  function next() {
    if (!layers.length) {
      throw new Error(t.util.format(' match not found for %s', req + ''));
    }
    var layer = layers.shift();
    var params = layer.match(req.path);
    if (!params) {
      return next();
    }
    debug('  match found: %s', layer.route + '');
    ctx.params = params;
    layer.route.handler.call(self, ctx);
  }

  next();

  return this;
};

Router.prototype.get = function (url) {
  return this.dispatch(Request.of('GET', url));
};

// alias
Router.prototype.redirect = function (url) {
  debug('redirecting to %s', url);
  return this.get(url);
};

Router.prototype.post = function (url, body) {
  return this.dispatch(Request.of('POST', url, body));
};

Router.prototype.debug = require('debug');

Route.prototype.toString = function() {
  return t.util.format('[%s %s, Route]', this.method, this.path);
};

module.exports = Router;