'use strict';

var t = require('tcomb');
var RequestEvent = require('./RequestEvent');
var on = require('./events').on;

function getUrl() {
  return window.location.pathname + window.location.search;
}

var HistoryLocation = t.struct({
  listeners: t.list(t.Func)
}, 'HistoryLocation');

HistoryLocation.prototype.install = function () {

  on(window, 'popstate', function (evt) {
    this.emit(new RequestEvent({
      method: 'GET',
      url: evt.state.url
    }));
  }.bind(this));

  window.history.replaceState({url: getUrl()});

  return this;
};

HistoryLocation.prototype.addChangeListener = function (listener) {
  this.listeners.push(listener);
  return this;
};

HistoryLocation.prototype.removeChangeListener = function (listener) {
  this.listeners = this.listeners.filter(function (f) {
    return f !== listener;
  });
  return this;
};

HistoryLocation.prototype.emit = function (evt) {
  this.listeners.forEach(function (listener) {
    listener(evt);
  });
  return this;
};

HistoryLocation.prototype.get = function (url) {
  window.history.pushState({url: url}, '', url);
  this.emit(new RequestEvent({
    method: 'GET',
    url: url
  }));
  return this;
};

HistoryLocation.prototype.post = function (url, body) {
  this.emit(new RequestEvent({
    method: 'POST',
    url: url,
    body: body
  }));
  return this;
};

module.exports = HistoryLocation;