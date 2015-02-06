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

var server = express();

// load the bootstrap page
var template = _.template(fs.readFileSync(__dirname + '/index.html', 'utf-8'));

// assets
server.use('/assets', express.static(__dirname));

// middlewares
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));

//
// state management
//

// globale state
var globalState = {
  'user@domain.com': {page: 'login'}
};

function login(email, password) {
  if (email !== 'user@domain.com' && password !== 'password') {
    return 'invalid username / password';
  }

  globalState['user@domain.com'] = {
    page: 'home',
    login: null,
    user: {
      email: email,
      password: password
    }
  };
}

function logout() {
  globalState['user@domain.com'] = {
    page: 'login',
    login: null,
    user: null
  };
}

//------------
// endpoints
//------------

function mixin(a, b) {
  for (var k in b) { a[k] = b[k]; }
}

// catch all gets and forward them to the router
server.get('/*', function (req, res) {
  router.getState = function () {
    return globalState['user@domain.com']; // TODO implement cookie auth
  };
  router.setState = function (state) {
    return mixin(globalState['user@domain.com'], state);
  };
  router.render = function (renderable) {
    res.send(template({
      ui: React.renderToString(renderable),
      state: JSON.stringify(this.getState())
    }));
  };
  router.get(req.originalUrl);
});

//
// JSON endpoints
//

server.post('/api/login', function (req, res) {
  var err = login(req.body.email, req.body.password);
  if (err) {
    return res.status(401).send({
      error: 'invalid username / password'
    });
  }
  res.sendStatus(200);
});

server.post('/api/logout', function (req, res) {
  logout();
  res.sendStatus(200);
});

//
// Old style endpoints
// (Required only if you want to handle
// disabled javascript)
//

server.post('/login', function (req, res) {
  var error = login(req.body.email, req.body.password);
  if (error) {
    globalState['user@domain.com'] = {
      page: 'login',
      login: {error: error}
    };
    return res.redirect('/login');
  }
  res.redirect('/home');
});

server.post('/logout', function (req, res) {
  logout();
  res.redirect('/login');
});

//
// start server
//

server.listen(5000, function() {
  console.log('Express server listening on localhost:5000');
});
