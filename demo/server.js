'use strict';

require('node-jsx').install({extension: '.jsx'});
var React = require('react');
var _ = require('underscore');
var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var router = require('./router.jsx');

//
// express app definition
//

var app = express();

// load the bootstrap page
var template = _.template(fs.readFileSync(__dirname + '/index.html', 'utf-8'));

// assets
app.use('/assets', express.static(__dirname));

// middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//
// state management
//

// initial state
router.state = {
  page: 'login'
};

function login(email, password) {
  if (email === 'user@domain.com' && password === 'password') {
    router.state.login = null;
    router.state.user = {
      email: email,
      password: password
    };
  } else {
    return 'invalid username / password';
  }
}

function logout() {
  router.state.user = null;
}

//------------
// endpoints
//------------

// catch all gets and forward them to the router
app.get('/*', function (req, res) {
  router.render = function (renderable) {
    res.send(template({
      ui: React.renderToString(renderable),
      state: JSON.stringify(router.state)
    }));
  };
  router.get(req.originalUrl);
});

//
// JSON endpoints
//

app.post('/api/login', function (req, res) {
  var err = login(req.body.email, req.body.password);
  if (err) {
    res.status(500).send({'error': 'invalid username / password'});
  } else {
    res.status(200).send({});
  }
});

app.post('/api/logout', function (req, res) {
  logout();
  res.status(200).send({});
});

//
// Old style endpoints
// (Required only if you want to handle
// disabled javascript)
//

app.post('/login', function (req, res) {
  var error = login(req.body.email, req.body.password);
  if (error) {
    router.state.login = {error: error};
    res.redirect('/login');
  } else {
    res.redirect('/home');
  }
});

app.post('/logout', function (req, res) {
  logout();
  res.redirect('/login');
});

//
// start server
//

app.listen(5000, function() {
  console.log('Express server listening on localhost:5000');
});
