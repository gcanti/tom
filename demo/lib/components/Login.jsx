'use strict';

var React = require('react');

var Login = React.createClass({

  doLogin: function (evt) {
    evt.preventDefault();
    var body = {
      email: this.refs.email.getDOMNode().value.trim() || null,
      password: this.refs.password.getDOMNode().value.trim() || null,
    };
    this.props.router.post('/login', body);
  },

  goResend: function (evt) {
    evt.preventDefault();
    this.props.router.get('/resend');
  },

  getMessage: function () {
    var state = this.props.router.state;
    return state.login && state.login.error ?
      <div className="alert alert-danger">{state.login.error}</div> :
      null;
  },

  render: function () {

    return (
      <div className="col-md-4 col-md-offset-4">
        <h3>Log In</h3>
        {this.getMessage()}
        <form action="/login" method="POST">
          <div className="form-group">
            <input ref="email" name="email" type="text" className="form-control" placeholder="Email" defaultValue="user@domain.com"/>
          </div>
          <div className="form-group">
            <input ref="password" name="password" type="password" className="form-control" placeholder="Password" defaultValue="password"/>
          </div>
          <div className="form-group">
            <a href="/resend" onClick={this.goResend}>Forgot your password?</a>
          </div>
          <button className="btn btn-primary" onClick={this.doLogin}>Log In</button>
        </form>
      </div>
    );
  }

});

module.exports = Login;