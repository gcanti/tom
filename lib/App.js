'use strict';

var t = require('tcomb');
var debug = require('debug')('App');
var Session = require('./Session');
var Router = require('./Router');
var Request = require('./Request');
var Response = require('./Response');
var assert = t.assert;

function App() {
  Router.call(this);
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
  debug('GET `%s`', url);
  var req = Request.of('GET', url);
  return this.dispatch(req, this.res);
};

App.prototype.post = function (url, body) {
  debug('POST `%s`', url);
  var req = Request.of('POST', url, body);
  return this.dispatch(req, this.res);
};

App.prototype.run = function (onRender) {
  assert(t.Func.is(onRender), 'onRender must be a function');
  debug('running');
  this.onRender = onRender;
  this.running = true;
  return this;
};

module.exports = App;