'use strict';

var React = require('react');
var t = require('../');
var util = require('./util');

//
// domain
//

var Todo = t.struct({
  id: t.Str,
  title: t.Str,
  completed: t.Bool
});

var State = t.list(Todo);

State.addTodo = function (state, todo) {
  return State.update(state, {'$push': [todo]});
};

State.removeTodo = function (state, id) {
  return State(state.filter(function (todo) {
    return todo.id !== id;
  }));
};

State.updateTodo = function (state, id, spec) {
  var index;
  state.forEach(function (todo, i) {
    if (todo.id === id) {
      index = i;
    }
  });
  var todo = Todo.update(state[index], spec);
  return State.update(state, {'$splice': [[index, 1, todo]]});
};

var state = State([]);



//
// app
//

var app = new t.om.App();

app.route({
  method: 'GET',
  path: '/all',
  handler: function (ctx) {
    ctx.res.render(<App state={state} />);
  }
});

app.route({
  method: 'POST',
  path: '/todo',
  handler: function (ctx) {
    state = State.addTodo(state, new Todo({
      id: util.uuid(),
      title: ctx.req.body.title,
      completed: false
    }));
    ctx.res.redirect('/all');
  }
});

app.route({
  method: 'POST',
  path: '/todo/:id/remove',
  handler: function (ctx) {
    state = State.removeTodo(state, ctx.params.id);
    ctx.res.redirect('/all');
  }
});

app.route({
  method: 'POST',
  path: '/todo/:id',
  handler: function (ctx) {
    state = State.updateTodo(state, ctx.params.id, ctx.req.body);
    ctx.res.redirect('/all');
  }
});

//
// ui
//
var App = React.createClass({

  add: function (evt) {
    var title = this.refs.input.getDOMNode().value.trim();
    if (title) {
      app.post('/todo', {title: title});
      this.refs.input.getDOMNode().value = '';
    }
  },

  toggle: function (id, evt) {
    app.post('/todo/' + id, {completed: {'$set': evt.target.checked}});
  },

  remove: function (id) {
    app.post('/todo/' + id + '/remove');
  },

  render: function () {

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
            this.props.state.map(function (todo) {
              var id = todo.id;
              return (
                <li key={todo.id} ref={id} className={todo.completed ? 'completed' : null}>
                  <div className="view">
                    <input className="toggle" type="checkbox" onChange={this.toggle.bind(this, id)}/>
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
    var footer = (
      <footer id="footer">
        <span id="todo-count">
          <strong>1</strong>
          <span> </span>
          <span>item</span>
          <span> left</span>
        </span>
        <ul id="filters">
          <li>
            <a href="#/" className="selected">All</a>
          </li>
          <span> </span>
          <li>
            <a href="#/active">Active</a>
          </li>
          <span> </span>
          <li>
            <a href="#/completed">Completed</a>
          </li>
        </ul>
        <button id="clear-completed">
          <span>Clear completed (</span><span>1</span><span>)</span>
        </button>
      </footer>
    );

    return (
      <div>
        {header}
        {main}
        {footer}
      </div>
    );
  }

});

// start the app
app.run(function (handler) {
  React.render(handler, document.getElementById('todoapp'));
});

// make a request
app.get('/all');

//t.om.debug.enable('*');
//t.om.debug.disable();


