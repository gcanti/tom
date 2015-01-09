'use strict';

var React = require('react');
var t = require('../../');
var util = require('./util');
var matcher = require('../../lib/matcher');
var App = require('./components/App.jsx');
var router = new t.om.Router(matcher);

router.route({
  method: 'GET', path: '/',
  handler: function () {
    router.get('/all');
  }
});

router.route({
  method: 'GET', path: '/all',
  handler: function (ctx) {
    router.state.setRoute(ctx.req.url);
    router.render(<App state={router.state()} router={router} />, router.state());
  }
});

router.route({
  method: 'GET', path: '/active',
  handler: function (ctx) {
    router.state.setRoute(ctx.req.url);
    router.render(<App state={router.state()} router={router} />, router.state());
  }
});

router.route({
  method: 'GET', path: '/completed',
  handler: function (ctx) {
    router.state.setRoute(ctx.req.url);
    router.render(<App state={router.state()} router={router} />, router.state());
  }
});

router.route({
  method: 'POST', path: '/todo',
  handler: function (ctx) {
    router.state.addTodo({
      id: util.uuid(),
      title: ctx.req.body.title,
      completed: false
    });
    router.get(router.state().route);
  }
});

router.route({
  method: 'POST', path: '/todo/:id',
  handler: function (ctx) {
    router.state.toggleTodo(ctx.params.id, ctx.req.body.completed);
    router.get(router.state().route);
  }
});

router.route({
  method: 'POST', path: '/todo/:id/remove',
  handler: function (ctx) {
    router.state.removeTodo(ctx.params.id);
    router.get(router.state().route);
  }
});

module.exports = router;