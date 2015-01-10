'use strict';

var React = require('react');

var Resend = React.createClass({

  goLogin: function (evt) {
    evt.preventDefault();
    this.props.router.get('/login');
  },

  render: function () {
    return (
      <div className="col-md-4 col-md-offset-4">
        <h3>Find Your Account</h3>
        <fieldset>
          <div className="form-group">
            <input ref="email" type="text" className="form-control" placeholder="Email"/>
          </div>
          <div className="form-group">
            <a href="/login" onClick={this.goLogin}>Login</a>
          </div>
          <button className="btn btn-primary" onClick={this.send}>Send</button>
        </fieldset>
      </div>
    );
  }

});

module.exports = Resend;