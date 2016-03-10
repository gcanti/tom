var pathToRegexp = require('path-to-regexp');

function Router(routes, history) {
  this.routes = [];
  this.history = history;
  for (var i = 0, len = routes.length ; i < len ; i++) {
    this.addRoute(routes[i].path, routes[i].handler);
  }
}

Router.prototype.addRoute = function (path, handler) {
  var keys = [];
  var re = pathToRegexp(path, keys);
  function match(pathname) {
    var m = re.exec(pathname);
    if (m) {
      var params = {};
      var key, param;
      for (var i = 0, len = keys.length; i < len; i++) {
        key = keys[i];
        param = m[i + 1];
        if (!param) {
          continue;
        }
        params[key.name] = decodeURIComponent(param);
        if (key.repeat) {
          params[key.name] = params[key.name].split(key.delimiter);
        }
      }
      return {
        params: params,
        handler: handler
      };
    }
  }
  match.path = path;
  this.routes.push(match);
};

Router.prototype.match = function(location, context) {
  for (var i = 0, len = this.routes.length ; i < len ; i++) {
    var route = this.routes[i];
    var match = route(location.pathname);
    if (match) {
      return match.handler({
        pathname: location.pathname,
        path: route.path,
        history: this.history,
        params: match.params,
        query: location.query,
        context: context
      });
    }
  }
  throw new Error('Route not found: ' + JSON.stringify(location));
};

module.exports = Router;