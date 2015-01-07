# Example

```js
var React = require('react');
var t = require('tom');

//
// domain
//

var Todo = t.struct({
  title: t.Str,
  completed: t.Bool
});
var State = t.list(Todo);
var state = State([]);

//
// app
//

var app = new t.om.App();

app.get('/todos', function (ctx) {
  ctx.res.render(<App state={state} />);
});

app.post('/todo', function (ctx) {
  var todo = new Todo({
    title: ctx.req.body.title,
    completed: false
  });
  state = State.update(state, {'$push': [todo]});
  ctx.res.redirect('/todos');
});

//
// ui
//
var App = React.createClass({

  addTodo: function () {
    var title = this.refs.input.getDOMNode().value.trim();
    if (title) {
      app.call('POST', '/todo', {title: title});
    }
  },

  render: function () {
    return (
      <div>
      <pre>{JSON.stringify(this.props.state, null, 2)}</pre>
      <input type="text" ref="input"/>
      <button onClick={this.addTodo}>Add</button>
      </div>
    );
  }
  
});

// start the app
app.run(function (handler) {
  React.render(handler, document.getElementById('app'));
});

// make a request
app.call('GET', '/todos');
```

# Session

The entire app state SHOULD be immutable and contained in one single place (see om) called *(user) session*.

```js
var t = require('tcomb');
var Session = require('tom/Session');

// developers MUST define this
var State = t.struct({
  ...
});

var session = new Session({
  State: State, // : Type, state constructor (required)
  initialState: {},    // : Obj, initial state (required)
  Patch: Patch, // : Type, patch constructor (optional)
  merge: ...    // : Func, patches merge strategy (optional)
});
```

## Get the state

```js
session.getState() -> State
```

## Update the state

```js
// default constructor
var Patch = t.struct({
  // the current state from the client POV
  token: t.maybe(State),
  // an acceptable argument for State.update
  spec: t.Obj
});

session.patch(patch: Patch, currentState: State) -> State
```

- if `patch.token === currentState` the patch will be applied
- if `merge` exists, will be called
- throws an error

### merge(patch, currentState)

Developers SHOULD implement:

```js
merge(patch: Patch, currentState: State) -> State
```

## Listen to state changes

```js
session.on('change', listener);
session.off('change', listener);
```

# Request

A request is an object containing the data associated to a route call:

```js
{
  method: "GET" | "POST",
  url: t.Str,
  path: t.Str,
  query: t.Obj,
  body: t.maybe(t.Obj)
}
```

# Response

```js
{
  redirect(url: t.Str), // same as app.call('GET', url)
  render(renderable: t.Any)
}
```

# Context

```js
{
  req: Request,
  res: Response,
  params: t.Obj, // contains the path params
  next() // exec next middleware
}
```

# Router

```js
var Router = require('tom/Router');
var router = new Router();
```

## Defining a route

```js
// GET
router.define({
  method: 'GET',
  path: '/users/:userId/projects',
  handler: function (ctx) {
    console.log(ctx.req.params.userId);
  }
});

// POST
router.define({
  method: 'POST',
  path: '/users/add',
  handler: function (ctx) {
    console.log(ctx.req.body);
  }
});
```

### Aliases

```js
app.get(path, handler);
app.post(path, handler);
```

## Dispatching

```js
router.dispatch(req: Request, res: Response)
```

# App

```js
var t = require('tom');
var app = new t.om.App();
```

Implements `Router` and:

```js
call(method: Method, url: Str, body: ?Obj)
run(onRender(renderable: Any))
```
