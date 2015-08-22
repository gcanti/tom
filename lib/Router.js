/*

  minimalistic universal router

*/

var querystring = require('querystring');
var parse = require('url').parse;
var pathToRegexp = require('path-to-regexp');

function mixin(x, y) {
  for (var k in y) {
    if (y.hasOwnProperty(k)) {
      x[k] = y[k];
    }
  }
}

function Context(path, params, query, context) {
  this.path = path;
  this.params = params;
  this.query = query;
  mixin(this, context);
}

function Match(route, context) {
  this.route = route;
  this.context = context;
}

Match.prototype.run = function () {
  return this.route.handler(this.context);
};

function getParams(match, keys) {
  var params = {};
  for (var i = 0, len = keys.length; i < len; i++) {
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

function Route(path, handler) {
  this.path = path;
  this.handler = handler;
  this.keys = [];
  this.regexp = pathToRegexp(path, this.keys);
}

Route.prototype.match = function (url, context) {
  var parsed = parse(url);
  var pathname = parsed.pathname;
  var match = this.regexp.exec(pathname);
  if (!match) {
    return null;
  }
  var params = getParams(match, this.keys);
  var query = querystring.parse(parsed.query);
  return new Match(this, new Context(pathname, params, query, context));
};

function Router(routes) {
  this.routes = typeof routes === 'object' ? [] : routes;
  if (routes) {
    for (var path in routes) {
      if (routes.hasOwnProperty(path)) {
        this.addRoute(path, routes[path]);
      }
    }
  }
}

Router.prototype.addRoute = function (path, handler) {
  this.routes.push(new Route(path, handler));
  return this;
};

Router.prototype.match = function (url, context) {
  for (var i = 0, len = this.routes.length; i < len; i++ ) {
    var match = this.routes[i].match(url, context);
    if (match) {
      return match;
    }
  }
};

Router.prototype.dispatch = function (url, context) {
  var match = this.match(url, context);
  if (match) {
    return match.run();
  }
};

// export for tests
Router.Route = Route;
Router.Match = Match;

module.exports = Router;
