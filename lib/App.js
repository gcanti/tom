var t = require('tcomb');
var EventEmitter = require('events').EventEmitter;

function App(initialState, Event) {
  EventEmitter.call(this);
  this.state = initialState;
  this.State = initialState.constructor;
  this.Event = Event || t.Any;
}

App.prototype = EventEmitter.prototype;
App.prototype.constructor = App;

App.prototype.patch = function (patch) {
  this.state = this.State(patch(this.state));
  this.emit('change', this.state);
};

App.prototype.getPatch = function (event) {
  event = this.Event(event);
  return event.toPatch();
};

App.prototype.process = function (event) {
  this.patch(this.getPatch(event));
};

module.exports = App;
