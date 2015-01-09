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

var State = t.struct({
  route: t.Str,
  todos: t.list(Todo)
}, 'State');

State.setRoute = function (route) {
  state = State.update(state, {route: {'$set': route}});
};

State.addTodo = function (todo) {
  state = State.update(state, {todos: {'$push': [todo]}});
};

State.removeTodo = function (id) {
  var todos = state.todos.filter(function (todo) {
    return todo.id !== id;
  });
  state = State.update(state, {todos: {'$set': todos}});
};

State.getTodoIndex = function (id) {
  var index;
  for (var i = 0, len = state.todos.length ; i < len ; i++ ) {
    if (state.todos[i].id === id) {
      index = i;
      break;
    }
  }
  return index;
};

State.toggleTodo = function (id, completed) {
  var index = State.getTodoIndex(id);
  var todo = Todo.update(state.todos[index], {completed: {'$set': completed}});
  state = State.update(state, {todos: {'$splice': [[index, 1, todo]]}})
};

var state = State({
  route: location.hash.substr(1) || '/all',
  todos: []
});

//
// app
//

var matcher = require('../lib/matcher');
var app = new t.om.App(matcher);

app.route({
  method: 'GET', path: '/all',
  handler: function (ctx) {
    State.setRoute(ctx.req.url);
    ctx.res.render(<App state={state} />);
  }
});

app.route({
  method: 'GET', path: '/active',
  handler: function (ctx) {
    State.setRoute(ctx.req.url);
    ctx.res.render(<App state={state} />);
  }
});

app.route({
  method: 'GET', path: '/completed',
  handler: function (ctx) {
    State.setRoute(ctx.req.url);
    ctx.res.render(<App state={state} />);
  }
});

app.route({
  method: 'POST', path: '/todo',
  handler: function (ctx) {
    State.addTodo(new Todo({
      id: util.uuid(),
      title: ctx.req.body.title,
      completed: false
    }));
    ctx.res.redirect(state.route);
  }
});

app.route({
  method: 'POST', path: '/todo/:id',
  handler: function (ctx) {
    State.toggleTodo(ctx.params.id, ctx.req.body.completed);
    ctx.res.redirect(state.route);
  }
});

app.route({
  method: 'POST', path: '/todo/:id/remove',
  handler: function (ctx) {
    State.removeTodo(ctx.params.id);
    ctx.res.redirect(state.route);
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

  toggleTodo: function (id, evt) {
    app.post('/todo/' + id, {completed: evt.target.checked});
  },

  remove: function (id) {
    app.post('/todo/' + id + '/remove');
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

// start the app
app.run(function (renderable) {
  React.render(renderable, document.getElementById('todoapp'));
});

window.onhashchange = function () {
  app.get(location.hash.substr(1));
};

if (location.hash) {
  window.onhashchange();
} else {
  location.hash = '/all';
}
//t.om.debug.enable('*');
//t.om.debug.disable();


