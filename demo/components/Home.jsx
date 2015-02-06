'use strict';

var React = require('react');

var Home = React.createClass({

  doLogout: function (evt) {
    evt.preventDefault();
    this.props.router.post('/logout');
  },

  render: function () {
    return (
      <div className="col-md-4 col-md-offset-4">
        <h3>Home</h3>
        <p>Welcome {this.props.router.getState().user.email}</p>
        <form action="/logout" method="POST">
          <button className="btn btn-primary" onClick={this.doLogout}>Log out</button>
        </form>
      </div>
    );
  }

});

module.exports = Home;