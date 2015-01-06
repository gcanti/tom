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

# Request

A request is an object containing the data associated to a route call:

```js
var Request = t.struct({
  method: t.enums.of('GET POST'),
  url: t.Str,
  path: t.Str,
  query: t.Obj,
  body: t.maybe(t.Obj)
});
```

# Response

```js
{
  flush(),                  // flush current state
  redirect(url: t.Str),     // same as app.get(url)
  render(renderable: t.Any)
}
```

# Context

```js
{
  session: Session,
  req: Request,
  res: Response,
  params: t.Obj,
  next() // exec next middleware
}
```

# Router

```js
var Router = require('tom/Router');
var router = new Router();
```

## Adding a route

```js
// GET
router.add({
  method: 'GET',
  path: '/users/:userId/projects',
  handler: function (ctx) {
    console.log(ctx.req.params.userId);
  }
});

// POST
router.add({
  method: 'POST',
  path: '/users/add',
  handler: function (ctx) {
    console.log(ctx.req.body);
  }
});
```

## Run a request against a router

```js
router.run(session: Session, req: Request, res: Response)
```

# App

```js
var App = require('tom/App');
var app = new App(session);
```

Implements `Router` and:

- `get(url: Str)`
- `post(url: Str, body: ?Obj)`
- `start(onRender(renderable), onFlush(state))`
