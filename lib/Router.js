'use strict';

var debug = require('debug')('Router');
var parse = require('url').parse;
var querystring = require('querystring');
var toUrl = require('./toUrl');

function Layer(route, match) {
  this.route = route;
  this.match = match;
}

function Request(method, url, path, query, body) {
  this.method = method;
  this.url = url;
  this.path = path;
  this.query = query;
  this.body = body;
}

Request.prototype.toString = function() {
  return '[' + this.method + ' ' + this.url + ', Request]';
};

Request.of = function (method, url, body) {
  var parsed = parse(url);
  return new Request(
    method,
    url,
    parsed.pathname,
    querystring.parse(parsed.query),
    body
  );
};

function Route(method, path, handler) {
  this.method = method;
  this.path = path;
  this.handler = handler;
}

Route.prototype.toString = function() {
  return '[' + this.method + ' ' + this.path + ', Route]';
};

function Context(req, next) {
  this.req = req;
  this.next = next;
}

function Router(opts) {
  this.matcher = opts.matcher;
  this.emitter = opts.emitter;
  this.layers = {};
}

Router.prototype.push = function (route) {
  route = new Route(route.method, route.path, route.handler);
  debug('push ' + route);
  var layers = this.layers[route.method] = this.layers[route.method] || [];
  layers.push(new Layer(route, this.matcher(route.path)));
  return this;
};

var noLayers = [];

Router.prototype.dispatch = function(req) {
  debug('dispatching ' + req);
  this.emitter.emit('dispatch', req);
  var layers = this.layers[req.method] ? this.layers[req.method].slice() : noLayers;
  debug('  %s layer(s) found', layers.length);
  var router = this;
  var ctx = new Context(req, next);

  function next() {
    if (!layers.length) {
      throw new Error(' match not found for ' + req);
    }
    var layer = layers.shift();
    var params = layer.match(req.path);
    if (!params) {
      return next();
    }
    debug('  match found: ' + layer.route);
    ctx.params = params;
    layer.route.handler.call(router, ctx); // router as `thisArg`
  }

  next();

  return this;
};

Router.prototype.get = function (url) {
  return this.dispatch(Request.of('GET', url));
};

Router.prototype.redirect = function (path, params, query) {
  var url = toUrl(path, params, query);
  debug('redirecting to %s', url);
  return this.get(url);
};

Router.prototype.post = function (url, body) {
  return this.dispatch(Request.of('POST', url, body));
};

module.exports = Router;