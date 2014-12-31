'use strict';

var t = require('tcomb');
var pathRegexp = require('path-to-regexp');
var Layer = require('./Layer');

var Tom = t.struct({
  location: t.Obj,
  GET: t.Arr,
  POST: t.Arr
});

Tom.prototype.get = function(path, handler, name) {
  this.GET.push(new Layer({
    method: 'GET',
    path: path,
    handler: handler,
    name: name,
    regexp: pathRegexp(path)
  }));
  return this;
};

Tom.prototype.post = function(path, handler, name) {
  this.POST.push(new Layer({
    method: 'POST',
    path: path,
    handler: handler,
    name: name,
    regexp: pathRegexp(path)
  }));
  return this;
};

Tom.prototype.handle = function(evt) {
  // FIXME
};

module.exports = Tom;