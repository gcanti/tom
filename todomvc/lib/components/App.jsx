'use strict';

var React = require('react');

var App = React.createClass({

  add: function (evt) {
    var title = this.refs.input.getDOMNode().value.trim();
    if (title) {
      this.props.router.post('/todo', {title: title});
      this.refs.input.getDOMNode().value = '';
    }
  },

  toggleTodo: function (id, evt) {
    this.props.router.post('/todo/' + id, {completed: evt.target.checked});
  },

  remove: function (id) {
    this.props.router.post('/todo/' + id + '/remove');
  },

  render: function () {

    var route = this.props.state.route;
    var todos = this.props.state.todos;

    // stats
    var len = todos.length;
    var nrCompleted = todos.reduce(function (acc, todo) {
      return acc + (todo.completed ? 1 : 0);
    }, 0);
    var nrLeft = len - nrCompleted;

    // filter
    if (route !== '/all') {
      todos = todos.filter(function (todo) {
        return todo.completed === (route !== '/active');
      });
    }

    var header = (
      <header id="header">
        <h1>todos</h1>
        <input type="text" placeholder="What needs to be done?" onKeyDown={this.add} ref="input"/>
      </header>
    );

    var main = (
      <section id="main">
        <input id="toggle-all" type="checkbox"/>
        <ul id="todo-list">
          {
            todos.map(function (todo) {
              var id = todo.id;
              return (
                <li key={todo.id} ref={id} className={todo.completed ? 'completed' : null}>
                  <div className="view">
                    <input className="toggle" type="checkbox" onChange={this.toggleTodo.bind(this, id)}/>
                    <label>{todo.title}</label>
                    <button className="destroy" onClick={this.remove.bind(this, id)}></button>
                  </div>
                  <input className="edit" defaultValue={todo.title}/>
                </li>
              );
            }.bind(this))
          }
        </ul>
      </section>
    );

    // FIXME
    var footer = null;
    if (len) {
      footer = (
        <footer id="footer">
          <span id="todo-count">
            <strong>{nrLeft}</strong>
            <span> </span>
            <span>item</span>
            <span> left</span>
          </span>
          <ul id="filters">
            <li>
              <a href="#/all" className={route === '/all' ? 'selected' : null}>All</a>
            </li>
            <span> </span>
            <li>
              <a href="#/active" className={route === '/active' ? 'selected' : null}>Active</a>
            </li>
            <span> </span>
            <li>
              <a href="#/completed" className={route === '/completed' ? 'selected' : null}>Completed</a>
            </li>
          </ul>
          {nrCompleted ?
            <button id="clear-completed">
              <span>Clear completed (</span><span>{nrCompleted}</span><span>)</span>
            </button> : null
          }
        </footer>
      );
    }

    return (
      <div>
        {header}
        {main}
        {footer}
      </div>
    );
  }

});

module.exports = App;