'use strict';

var t = require('tcomb');
var debug = require('debug')('App');
var Session = require('./Session');
var Router = require('./Router');
var Request = require('./Request');
var Response = require('./Response');
var assert = t.assert;

function flush() {
  debug('flushing');
  this.onFlush(this.session.getState());
}

function redirect(url) {
  debug('redirecting to `%s`', url);
  this.get(url);
}

function render(renderable) {
  debug('rendering');
  this.onRender(renderable);
}

function App(session) {
  Router.call(this);
  assert(session instanceof Session, 'missing session');
  this.session = session;
  this.started = false;
  this.res = new Response({
    flush: flush.bind(this),
    redirect: redirect.bind(this),
    render: render.bind(this)
  });
}

App.prototype.get = function(url) {
  assert(this.started, 'cannot get() before start');
  debug('GET `%s`', url);
  var req = Request.of('GET', url);
  this.run(this.session, req, this.res);
};

App.prototype.post = function(url, body) {
  assert(this.started, 'cannot post() before start');
  debug('POST `%s`', url);
  var req = Request.of('POST', url, body);
  this.run(this.session, req, this.res);
};

App.prototype.start = function(onRender, onFlush) {
  assert(t.Func.is(onRender), 'onRender must be a function');
  assert(t.Func.is(onFlush), 'onFlush must be a function');
  debug('starting');
  this.onRender = onRender;
  this.onFlush = onFlush;
  this.started = true;
};

t.util.mixin(App.prototype, Router.prototype);

module.exports = App;