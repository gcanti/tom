'use strict';

var React = require('react');

var Home = React.createClass({

  render: function () {
    return (
      <div className="col-md-4 col-md-offset-4">
        <h3>Home</h3>
        <p>Welcome {this.props.router.state.user.email}</p>
      </div>
    );
  }

});

module.exports = Home;