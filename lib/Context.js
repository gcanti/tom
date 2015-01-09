'use strict';

var Request = require('./Request');

function Context(req, res, next) {
  this.req = new Request(req);
  this.next = next;
  this.params = {};
}

module.exports = Context;