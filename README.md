Because routing and state management should be simple.

**Contents**

- [Router](#router)
- [App](#app)

# Router

Minimalistic universal router.

## API

### constructor(routes)

Where `routes: {[key: String]: Function}` is a dictionary `path -> handler` and `handler` has the following signature:

```js
(context: Context) -> any
```

`Context` is a struct with the following fields:

- `path: String`
- `params: : {[key: String]: String}`
- `query: {[key: String]: String}`
- `payload: Any` (optional)

**Example**

```js
var Router = require('tom').Router;

// define some handlers

function home(context) {
  ...
}

function user(context) {
  var userId = context.params.id;
  ...
}

// define the router

var router = new Router({
  '/home': home,
  '/user/:id': user
});
```

### addRoute(path, handler)

If the order in which the routes are scanned is important.

Example:

```js
router
  .addRoute('/home', home);
  .addRoute('/user/:id', user);
```

### dispatch(url, [context])

**Example**

```js
router.dispatch('/user/123?q=1', { myvalue: 1 });

/*
will call user(context) with the following argument as context:
{
  path: '/user/123',
  params: { id: '123' },
  query: { q: '1' },
  myvalue: 1
}
*/
```

## Building a hash router

```js
var state = require('./state');
var router = new Router(...);

window.onhashchange = function () {
  const url = location.hash.substr(1);
  if (url !== state.url) {
    router.dispatch(url);
  }
};

state.on('change', function (state) {
  location.hash = '#' + url;
});
```

# App

Type checked state management.

The main primitive is the **patch function**, i.e. a function with the following signature:

```
(state) => state // patch functions are naturally composable
```

Data flow:

```
State -> Event -> patch function -> State
```

For example:

```
[] -> AddTodoEvent -> (todos) => todos.concat({text: 'a todo'}) -> [{text: 'a todo'}]
```

**Example (ES6)**

```js
import { App, t } from '../index';
import _ from 'lodash';

//
// define the state type
//

const Todo = t.struct({
  id: t.String,         // required string
  text: t.String,       // required string
  completed: t.Boolean  // required boolean
}, 'Todo');

const State = t.struct({
  todos: t.list(Todo)   // a list of Todo objects
}, 'State');

//
// define the initial state
//

const initialState = State({
  todos: [
    {
      id: '1',
      text: 'Consider using tom',
      completed: true,
    },
    {
      id: '2',
      text: 'Keep all state in a single tree',
      completed: false
    }
  ]
});

//
// define the events and toPatch functions
//

const AddTodoEvent = t.struct({
  id: t.String,
  text: t.String,
  completed: t.Boolean
});

AddTodoEvent.prototype.toPatch = function () {
  return (state) => t.update(state, {
    todos: { $push: [this] }
  });
};

const EditTodoEvent = t.struct({
  id: t.String,
  text: t.String
});

EditTodoEvent.prototype.toPatch = function editTodo() {
  return (state) => {
    const index = _.findIndex(state.todos, { id: this.id });
    return t.update(state, {
      todos: {
        [index]: {
          text: { $set: this.text }
        }
      }
    });
  };
};

var Event = t.union([AddTodoEvent, EditTodoEvent], 'Event');

//
// define your app
//

class MyApp extends App {

  addTodo(id, text) {
    this.process(AddTodoEvent({ id, text, completed: false }));
  }

  editTodo(id, text) {
    this.process(EditTodoEvent({ id, text }));
  }

}

const app = new MyApp(initialState, Event);

app.on('change', (state) => {
  console.log('app state changed to ', state);
});

app.addTodo('3', 'another todo');
app.editTodo('3', 'another todo updated');
```

## Middlewares (ES7)

```js
function logger(App) {
  const process = App.prototype.process;
  App.prototype.process = function (event) {
    console.log('state before: ', this.state);
    process.call(this, event);
    console.log('state after: ', this.state);
  };
}

@logger
class MyApp extends App {

  addTodo(id, text) {
    this.process(AddTodoEvent({ id, text, completed: false }));
  }

  editTodo(id, text) {
    this.process(EditTodoEvent({ id, text }));
  }

}
```