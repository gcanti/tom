'use strict';

require('node-jsx').install({extension: '.jsx'});
var React = require('react');
var express = require('express');
var app = express();
var _ = require('underscore');
var fs = require('fs');
var template = _.template(fs.readFileSync(__dirname + '/index.html', 'utf-8'));

var router = require('./lib/router.jsx');

// assets
app.use('/assets', express.static(__dirname));

var initialState = {
  route: '/all',
  todos: [{
    id: '1',
    title: 'title',
    completed: false
  }]
};
router.state = require('./lib/state')(initialState);

app.get('/*', function (req, res) {
  router.render = function (renderable, state) {
    res.send(template({
      ui: React.renderToString(renderable),
      state: JSON.stringify(state)
    }));
  };
  router.get(req.originalUrl);
});

app.listen(5000, function() {
  console.log('Express server listening on port 5000');
});
