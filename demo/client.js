'use strict';

var React = require('react');
var router = require('./router.jsx');
var HistoryLocation = require('../lib/HistoryLocation');

window.React = React;

// outputs debug messages to console
require('debug').enable('*');

function mixin(a, b) {
  for (var k in b) { a[k] = b[k]; }
}

// configure state
router.getState = function () {
  return window.state;
};
router.setState = function (state) {
  return mixin(window.state, state);
};

// configure rendering
router.render = function (renderable) {
  React.render(renderable, document.getElementById('app'));
};

//
// start client
// This will force a React re-rendering
//
new HistoryLocation(router).start();
