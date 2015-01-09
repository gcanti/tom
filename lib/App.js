'use strict';

var t = require('tcomb');
var debug = require('debug')('App');
var Session = require('./Session');
var Router = require('./Router');
var Request = require('./Request');
var Response = require('./Response');
var assert = t.assert;

function App(matcher) {
  Router.call(this, matcher);
  this.started = false;
  this.res = new Response({
    redirect: this.redirect.bind(this),
    render: this.render.bind(this)
  });
}

t.util.mixin(App.prototype, Router.prototype);

App.prototype.redirect = function (url) {
  debug('redirecting to `%s`', url);
  return this.get(url);
};

App.prototype.render = function (renderable) {
  debug('rendering');
  this.onRender(renderable);
  return this;
};

App.prototype.get = function (url) {
  var req = Request.of('GET', url);
  debug(req + '');
  return this.dispatch(req, this.res);
};

App.prototype.post = function (url, body) {
  var req = Request.of('POST', url, body);
  debug(req + '');
  return this.dispatch(req, this.res);
};

App.prototype.run = function (onRender) {
  assert(t.Func.is(onRender), 'Invalid argument `onRender` supplied to run()');
  this.onRender = onRender;
  this.running = true;
  debug('running');
  return this;
};

module.exports = App;