'use strict';

var t = require('tcomb');

var Method = t.enums.of('GET POST', 'Method');

module.exports = Method;
