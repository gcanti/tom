'use strict';

var React = require('react');
var router = require('./router.jsx');
var HistoryLocation = require('../lib/HistoryLocation');

window.React = React;

// outputs debug messages to console
require('debug').enable('*');

// configure state
router.state = window.state;

// configure rendering
router.render = function (renderable) {
  React.render(renderable, document.getElementById('app'));
};

//
// start client
// This will force a React re-rendering
//
new HistoryLocation(router).start();
