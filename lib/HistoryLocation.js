'use strict';

var Router = require('./Router');
var debug = require('debug')('HistoryLocation');

function HistoryLocation(router) {
  this.router = router;
  this.onPopState = function (evt) {
    if (evt.state) {
      debug('onPopState: ', evt.state);
      router.get(evt.state.url);
    }
  };
}

HistoryLocation.prototype.start = function () {
  // push in history everytime a GET occurs
  this.router.emitter.on('dispatch', function (req) {
    if (req.method === 'GET') {
      history.pushState({url: req.url}, '', req.url);
    }
  });
  // hydrate the client forcing a re-redering
  this.router.get(location.href);
  // handle back / forward buttons
  if (window.addEventListener) {
    window.addEventListener('popstate', this.onPopState);
  } else {
    window.attachEvent('popstate', this.onPopState);
  }
  return this;
};

HistoryLocation.prototype.stop = function () {
  if (window.addEventListener) {
    window.removeEventListener('popstate', this.onPopState);
  } else {
    window.removeEvent('popstate', this.onPopState);
  }
  return this;
};

module.exports = HistoryLocation;