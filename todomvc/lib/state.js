'use strict';

var t = require('../../');

var Todo = t.struct({
  id: t.Str,
  title: t.Str,
  completed: t.Bool
});

var State = t.struct({
  route: t.Str,
  todos: t.list(Todo)
}, 'State');

var state;

function getState() {
  return state;
}

getState.setRoute = function (route) {
  state = State.update(state, {route: {'$set': route}});
};

getState.addTodo = function (todo) {
  todo = new Todo(todo);
  state = State.update(state, {todos: {'$push': [todo]}});
};

getState.removeTodo = function (id) {
  var todos = state.todos.filter(function (todo) {
    return todo.id !== id;
  });
  state = State.update(state, {todos: {'$set': todos}});
};

function getTodoIndex(id) {
  var index;
  for (var i = 0, len = state.todos.length ; i < len ; i++ ) {
    if (state.todos[i].id === id) {
      index = i;
      break;
    }
  }
  return index;
}

getState.toggleTodo = function (id, completed) {
  var index = getTodoIndex(id);
  var todo = Todo.update(state.todos[index], {completed: {'$set': completed}});
  state = State.update(state, {todos: {'$splice': [[index, 1, todo]]}})
};

function init(initialState) {
  state = new State(initialState);
  return getState;
}

module.exports = init;