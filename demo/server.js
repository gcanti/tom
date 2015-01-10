'use strict';

require('node-jsx').install({extension: '.jsx'});
var React = require('react');
var _ = require('underscore');
var fs = require('fs');
var template = _.template(fs.readFileSync(__dirname + '/index.html', 'utf-8'));
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var router = require('./lib/router.jsx');
var request = require('superagent');
var debug = router.debug('Server');

// assets
app.use('/assets', express.static(__dirname));
// middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

router.state = {
  page: 'login'
};

app.get('/*', function (req, res) {
  router.render = function (renderable) {
    res.send(template({
      ui: React.renderToString(renderable),
      state: JSON.stringify(router.state)
    }));
  };
  router.get(req.originalUrl);
});

app.post('/login', function (req, res) {
  var body = req.body;
  if (body.email === 'user@domain.com' && body.password === 'password') {
    router.state.user = body;
    res.redirect('/home');
  } else {
    console.log('invalid username / password');
    res.redirect('/login');
  }
});

app.post('/api/login', function (req, res) {
  var body = req.body;
  if (body.email === 'user@domain.com' && body.password === 'password') {
    router.state.user = body;
    res.status(200).send({});
  } else {
    console.log('invalid username / password');
    res.status(500).send({'error': 'invalid username / password'});
  }
});

app.listen(5000, function() {
  console.log('Express server listening on localhost:5000');
});
