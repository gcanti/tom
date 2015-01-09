'use strict';

var t = require('tcomb');
var Context = require('./Context');
var debug = require('debug')('Router');
var Method = require('./Method');
var Request = require('./Request');

var Params = t.dict(t.Str, t.Type, 'Params');

var Route = t.struct({
  method: Method,
  path: t.Str,
  handler: t.Func,
  name: t.maybe(t.Str),
  params: t.maybe(Params)
}, 'Route');

Route.prototype.toString = function() {
  return t.util.format('[%s %s, Route]', this.method, this.path);
};

var Layer = t.struct({
  route: Route,
  match: t.Func
}, 'Layer');

function Router(matcher) {
  this.matcher = matcher;
  this.layers = {};
}

Router.prototype.debug = require('debug');

Router.prototype.route = function (route) {

  route = new Route(route);

  debug('adding %s', route + '');
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
  var layers = this.getLayers(req.method);
  debug('%s candidate layer(s) found', layers.length);

  var ctx = new Context(req, next);

  function next() {
    if (!layers.length) {
      throw new Error(t.util.format('Match not found for `%s %s`', req.method, req.path));
    }
    var layer = layers.shift();
    var params = layer.match(req.path);
    if (!params) {
      return next();
    }
    debug('match found: %s', layer.route + '');
    ctx.params = params;
    layer.route.handler(ctx);
  }

  next();

  return this;
};

Router.prototype.get = function (url) {
  var req = Request.of('GET', url);
  debug(req + '');
  return this.dispatch(req, this.res);
};

Router.prototype.post = function (url, body) {
  var req = Request.of('POST', url, body);
  debug(req + '');
  return this.dispatch(req, this.res);
};

module.exports = Router;