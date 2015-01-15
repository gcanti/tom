'use strict';

var React = require('react');
var router = require('./router.jsx');
var HistoryLocation = require('../lib/HistoryLocation');

// configure state
router.state = window.state;

// configure rendering
router.render = function (renderable) {
  React.render(renderable, document.getElementById('app'));
};

// configure location
var location = new HistoryLocation(router).start();

// outputs debug messages to console
require('debug').enable('*');

