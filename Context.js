'use strict';

var t = require('tcomb');
var Session = require('./Session');
var Request = require('./Request');
var Response = require('./Response');

function Context(session, req, res, next) {
  t.assert(session instanceof Session, 'missing session');
  this.session = session;
  this.req = new Request(req);
  this.res = new Response(res);
  this.next = next;
}

module.exports = Context;