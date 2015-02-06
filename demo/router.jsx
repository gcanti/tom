'use strict';

var React = require('react');
var Router = require('../').Router;
var App = require('./components/App.jsx');
var Login = require('./components/Login.jsx');
var Resend = require('./components/Resend.jsx');
var Home = require('./components/Home.jsx');
var request = require('superagent');

var router = new Router();

router.push({
  method: 'GET',
  path: '/',
  handler: function (ctx) {
    this.redirect('/' + this.getState().page);
  }
});

router.push({
  method: 'GET',
  path: '/(.*)',
  handler: function (ctx) {
    ctx.partials = [App];
    ctx.next();
  }
});

router.push({
  method: 'GET',
  path: '/login',
  handler: function (ctx) {
    if (this.getState().user) {
      return this.redirect('/home');
    }
    this.setState({page: 'login'});
    var Renderable = ctx.partials.reduce(function (view, Partial) {
      return <Partial router={this}>{view}</Partial>
    }, <Login router={this} />);
    this.render(Renderable);
  }
});

router.push({
  method: 'GET',
  path: '/resend',
  handler: function (ctx) {
    if (this.getState().user) {
      return this.redirect('/home');
    }
    this.setState({page: 'resend'});
    var Renderable = ctx.partials.reduce(function (view, Partial) {
      return <Partial router={this}>{view}</Partial>
    }, <Resend router={this} />);
    this.render(Renderable);
  }
});

router.push({
  method: 'POST',
  path: '/login',
  handler: function (ctx) {
    var body = ctx.req.body;
    // superagent call
    request
      .post('/api/login')
      .accept('json')
      .send(body)
      .end(function (result) {
        if (!result.ok) {
          this.setState({login: {error: result.body.error}});
          return this.redirect('/login');
        }
        this.setState({user: body});
        this.redirect('/home');
    }.bind(this));
  }
});

router.push({
  method: 'GET',
  path: '/home',
  handler: function (ctx) {
    if (!this.getState().user) {
      return this.redirect('/login');
    }
    this.setState({page: 'home'});
    var Renderable = ctx.partials.reduce(function (view, Partial) {
      return <Partial router={this}>{view}</Partial>
    }, <Home router={this} />);
    this.render(Renderable);
  }
});

router.push({
  method: 'POST',
  path: '/logout',
  handler: function (ctx) {
    // superagent call
    request
      .post('/api/logout')
      .accept('json')
      .end(function (result) {
        if (!result.ok) {
          return this.redirect('/home');
        }
        this.setState({login: null, user: null});
        this.redirect('/login');
    }.bind(this));
  }
});

module.exports = router;