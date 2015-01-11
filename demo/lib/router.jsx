'use strict';

var React = require('react');
var t = require('../..');
var App = require('./components/App.jsx');
var Login = require('./components/Login.jsx');
var Resend = require('./components/Resend.jsx');
var Home = require('./components/Home.jsx');
var request = require('superagent');
var EventEmitter = require('eventemitter3');

var router = new t.om.Router();

router.route({
  method: 'GET',
  path: '/',
  handler: function (ctx) {
    this.redirect('/' + this.state.page);
  }
});

router.route({
  method: 'GET',
  path: '/(.*)',
  handler: function (ctx) {
    ctx.handlers = [App];
    ctx.next();
  }
});

router.route({
  method: 'GET',
  path: '/login',
  handler: function (ctx) {
    this.state.page = 'login';

    var Renderable = ctx.handlers.reduce(function (handler, Outer) {
      return <Outer handler={handler} router={this} />
    }, <Login router={this} />);

    this.render(Renderable);
  }
});

router.route({
  method: 'GET',
  path: '/resend',
  handler: function (ctx) {
    this.state.page = 'resend';

    var Renderable = ctx.handlers.reduce(function (handler, Outer) {
      return <Outer handler={handler} router={this} />
    }, <Resend router={this} />);

    this.render(Renderable);
  }
});

router.route({
  method: 'POST',
  path: '/login',
  handler: function (ctx) {
    var body = ctx.req.body;
    // superagent call
    request
      .post('/api/login')
      .send(body)
      .end(function (result) {
        if (!result.ok) {
          return this.redirect('/login', {}, {error: result.body.error});
        }
        this.state.user = body;
        this.redirect('/home');
    }.bind(this));
  }
});

router.route({
  method: 'GET',
  path: '/home',
  handler: function (ctx) {
    if (!this.state.user) {
      return this.redirect('/login');
    }
    this.state.page = 'home';
    var Renderable = ctx.handlers.reduce(function (handler, Outer) {
      return <Outer handler={handler} router={this} />
    }, <Home router={this} />);
    this.render(Renderable);
  }
});

module.exports = router;