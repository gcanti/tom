'use strict';

var React = require('react');
var router = require('./lib/router.jsx');

router.state = require('./lib/state')(state);

router.render = function (renderable) {
  React.render(renderable, document.getElementById('todoapp'));
};

window.onhashchange = function () {
  router.get(location.hash.substr(1));
};

// hydrate
if (location.hash.substr(1) !== state.route) {
  location.hash = state.route;
} else {
  window.onhashchange();
}

router.debug.enable('*');
//router.debug.disable();


