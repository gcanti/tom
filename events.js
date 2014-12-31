'use strict';

function on(el, eventName, handler) {
  if (el.addEventListener) {
    el.addEventListener(eventName, handler, false);
  } else {
    el.attachEvent('on' + eventName, handler);
  }
}

function off(el, eventName, handler) {
  if (el.removeEventListener) {
    el.removeEventListener(eventName, handler, false);
  } else {
    el.removeEvent('on' + eventName, handler);
  }
}

module.exports = {
  on: on,
  off: off
};