'use strict';

var React = require('react');
var router = require('./lib/router.jsx');
var debug = router.debug('Client');

router.debug.enable('*');
//router.debug.disable();

router.state = window.state;

router.render = function (renderable) {
  React.render(renderable, document.getElementById('app'));
};

// set to true to get an old style app
var refreshing = false;
if (!refreshing) {
  var url = '/' + state.page;
  router.get(url);
  history.replaceState({url: url}, '', url);

  router.emitter.on('dispatch', function (req) {
    if (req.method === 'GET') {
      history.pushState({url: req.url}, '', req.url);
    }
  });

  window.onpopstate = function (evt) {
    debug('onpopstate: ', evt.state);
    router.get(evt.state.url);
  };
}
