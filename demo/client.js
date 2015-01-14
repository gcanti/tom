'use strict';

var React = require('react');
var router = require('./router.jsx');
var HistoryLocation = require('../lib/HistoryLocation');

window.router = router;

// configure state
router.state = window.state;

// configure rendering
router.render = function (renderable) {
  React.render(renderable, document.getElementById('app'));
};

// set to false to get an old style app instead of an SPA
if (true) {
  var location = new HistoryLocation(router).start();
}

// outputs debug messages to console
require('debug').enable('*');

