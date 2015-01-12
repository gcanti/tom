'use strict';

var React = require('react');
var router = require('./lib/router.jsx');
var debug = require('debug')('Client');

// configure state
router.state = window.state;

// configure rendering
router.render = function (renderable) {
  React.render(renderable, document.getElementById('app'));
};

// set to false to get an old style app instead of an SPA
var isSPA = true;
if (isSPA) {

  // hydrate the client forcing a React re-redering
  router.get('/' + state.page);

  // push in history everytime a GET occurs
  router.emitter.on('dispatch', function (req) {
    if (req.method === 'GET') {
      history.pushState({url: req.url}, '', req.url);
    }
  });

  // handle back / forward buttons
  window.onpopstate = function (evt) {
    if (evt.state) {
      debug('onpopstate: ', evt.state);
      router.get(evt.state.url);
    }
  };
}

// outputs debug messages to console
require('debug').enable('*');

