'use strict';

var React = require('react');

var App = React.createClass({

  render: function () {
    return (
      <div className="panel panel-primary">
        <div className="panel-heading text-center">
          tom demo
        </div>
        <div className="panel-body">
          {this.props.handler}
        </div>
      </div>
    );
  }

});

module.exports = App;