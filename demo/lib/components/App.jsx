'use strict';

var React = require('react');

var App = React.createClass({

  render: function () {
    return (
      <div className="panel panel-default">
        <div className="panel-heading text-center">
          tom demo
        </div>
        <div className="panel-body">
          {this.props.children}
        </div>
      </div>
    );
  }

});

module.exports = App;