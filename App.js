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
  return this.call('GET', url);
};

App.prototype.render = function (renderable) {
  debug('rendering');
  this.onRender(renderable);
  return this;
};

App.prototype.call = function (method, url, body) {
  assert(this.running, 'cannot get() before start');
  debug('GET `%s`', url);
  var req = Request.of(method, url, body);
  this.dispatch(req, this.res);
  return this;
}

App.prototype.run = function (onRender) {
  assert(t.Func.is(onRender), 'onRender must be a function');
  debug('running');
  this.onRender = onRender;
  this.running = true;
  return this;
};

module.exports = App;