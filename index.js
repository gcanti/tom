'use strict';

var Tom = require('./Tom');

function tom(Location) {
  var location = new Location({listeners: []}, true).install();
  var app = new Tom({
    location: location,
    GET: [],
    POST: []
  }, true);
  location.addChangeListener(app.handle.bind(app));
  return app;
}

module.exports = tom;