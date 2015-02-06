'use strict';

var Router = require('./lib/Router');
var matcher = require('./lib/matcher');
var EventEmitter = require('eventemitter3');
var debug = require('debug');

module.exports = {
  debug: debug,
  Router: function () {
    return new Router({
      matcher: matcher,
      emitter: new EventEmitter()
    });
  }
};
