'use strict';

var t = require('tcomb');
var Router = require('./lib/Router');
var matcher = require('./lib/matcher');
var EventEmitter = require('eventemitter3');

t.om = {
  Router: function () {
    return new Router({
      matcher: matcher,
      emitter: new EventEmitter()
    });
  }
};

module.exports = t;
