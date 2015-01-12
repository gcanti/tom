'use strict';

var t = require('tcomb');
var debug = require('debug')('Router');
var Method = require('./Method');
var Request = require('./Request');
var Route = require('./Route');
var toUrl = require('./toUrl');

var Layer = t.struct({
  route: Route,
  match: t.Func
}, 'Layer');

function Context(req, next) {
  this.req = new Request(req);
  this.next = next;
  this.params = {};
}

function Router(opts) {
  this.matcher = opts.matcher;
  this.emitter = opts.emitter;
  this.layers = {};
}

t.util.mixin(Router.prototype, {

  route: function (route) {
    route = new Route(route);
    debug('def %s', route + '');
    var layers = this.layers[route.method] = this.layers[route.method] || [];
    layers.push(new Layer({
      route: route,
      match: this.matcher(route.path)
    }));
    return this;
  },

  getLayers: function(method) {
    return this.layers[method] ? this.layers[method].slice() : [];
  },

  dispatch: function(req) {
    req = new Request(req);
    debug('dispatching %s', req + '');
    this.emitter.emit('dispatch', req);
    var layers = this.getLayers(req.method);
    debug('  %s layer(s) found', layers.length);

    var router = this;
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
      // call the handle with the router as `this`
      layer.route.handler.call(router, ctx);
    }

    next();

    return this;
  },

  get: function (url) {
    return this.dispatch(Request.of('GET', url));
  },

  // alias
  redirect: function (path, params, query) {
    var url = toUrl(path, params, query);
    debug('redirecting to %s', url);
    return this.get(url);
  },

  post: function (url, body) {
    return this.dispatch(Request.of('POST', url, body));
  }

});

module.exports = Router;