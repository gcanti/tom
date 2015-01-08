'use strict';

var Request = require('./Request');
var Response = require('./Response');

function Context(req, res, next) {
  this.req = new Request(req);
  this.res = new Response(res);
  this.next = next;
}

module.exports = Context;