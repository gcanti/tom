'use strict';

var querystring = require('querystring');

function toUrl(path, params, query) {
  var url = path;
  if (params) {
    for (var k in params) {
      if (params.hasOwnProperty(k)) {
        url = url.replace(':' + k, params[k]);
      }
    }
  }
  if (query) {
    url += (path.indexOf('?') === -1 ? '?' : '') + querystring.stringify(query)
  }
  return url;
}

module.exports = toUrl;

