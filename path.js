'use strict';

function decode(path) {
  return decodeURI(path.replace(/\+/g, ' '));
}

function encode(path) {
  return encodeURI(path).replace(/%20/g, '+');
}

module.exports = {
  decode: decode,
  encode: encode
};