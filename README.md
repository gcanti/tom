# Session

The entire app state SHOULD be immutable and contained in one single place (see om) called *(user) session*.

```js
var t = require('tcomb');
var Session = require('lib/Session');

// developers MUST define this
var State = t.struct({
  ...
});

// developers MAY define this
var Patch = t.struct({
  state: t.maybe(State),
  data: ... // default t.Obj
});

var session = new Session({
  State: State, // state constructor (required)
  state: {},    // initial state (required)
  Patch: Patch, // patch constructor (optional)
  merge: function () {} // patch merge strategy (optional)
});
```

## Get the state

```js
session.getState() -> State
```

Updating the state means applying a *patch*:

## Patch the state

```js
// default constructor
var Patch = t.struct({
  // the current state for the client
  state: t.maybe(State),
  // an acceptable argument for State.update
  data: t.Obj
});
```

To applying a patch call the `patch` method:

```js
session.patch(patch: Patch, function (err, newState) {
  ...
})
```

The callback is optional.

There are 2 cases:

## 1.

Condition: `patch.state === session.getState()`

The patch will be applied and the `callback` will be called with `callback(null, newState)`


## 2.

Call `session.merge` if exists, otherwise call `callback` with:

```js
err = new Error('invalid state');
err.patch = patch;
```

### merge

Developers SHOULD implement:

```js
session.merge(patch: Patch, currenState: State, callback)
```

Where `callback` has the following signature `(err, state) -> Nil`.
`merge` MUST call `callback(err)` if it's not possible to merge the states or
call `callback(null, state)` where `state` is the merged state.

## Listen to state changes and errors

```js
session.on('change' | 'error', listener);
session.off('change' | 'error', listener);
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
