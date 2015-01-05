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
  state: {},    // : Obj, initial state (required)
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
  data: t.Obj
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

# Context

A context is an object containing the data associated to a route call:

- `session: Session`
- `method: "GET" | "POST"`
- `url: Str`
- `params: Obj`
- `query: Obj`
- `body: ?Obj`
- `render(renderable: Any)`

# Handler

An handler is a function with the following signature:

```
(ctx: Context, next: Func) -> Nil
```

# Router

```js
var Router = require('lib/Router');
var router = new Router();
```

## Adding a route

```js
// GET
router.add({
  method: 'GET',
  path: '/users/:userId/projects',
  handler: function (ctx, next) {
    console.log(req.params.userId);
  }
});

// POST
router.add({
  method: 'POST',
  path: '/users/add',
  handler: function (ctx, next) {
    console.log(req.body);
  }
});
```

## Run a url against a router

```js
router.run(url: Str, ctx: ?Context);
```

# App

```js
var App = require('lib/App');
var app = new App(session);
```

Implements `Router` and:

- `get(path: Str)`
- `post(path: Str, body: ?Obj)`
- `start(callback: (renderable) -> Nil)`
