A complete routing library <del>for React</del>.

# Features

- GETs and **POSTs** abstraction
- write links and forms like you'd do in an old style web
- runs both client-side and server-side ("isomorphic")
- hapijs-like route definition
- middlewares
- configurable state management
- configurable ui target (React, others...)
- easy management of nested views (a la react-router)
- simple api:
  - `push(options)`
  - `redirect(path, params?, query?)`
  - `get(url)`
  - `post(url, body?)`
- lightweight (~250 LOC)
- injectable path to regexp implementation (default [path-to-regexp](https://github.com/pillarjs/path-to-regexp), used by the next version of express.js)
- injectable emitter implementation (default [eventemitter3](https://github.com/primus/eventemitter3))

# Demo

Real world use case, it contains 3 pages:
  - login
  - resend password
  - home (logged only)

Backend: [expressjs](http://expressjs.com)

```
git clone https://github.com/gcanti/tom.git
cd tom
npm install
npm start
```

# Gist

myrouter.js

```js
var React = require('react');
var Router = require('tom').Router;

var router = new Router();

router.push({
  // get all todos
  method: 'GET',
  path: '/all',
  handler: function (ctx) {
    this.render(<App router={this} />);
  }
});

// tom also provides an abstraction for POSTs
router.push({
  // add new todo
  method: 'POST',
  path: '/add',
  handler: function (ctx) {
    // router.state is assumed, see client.js and server.js
    this.state.push({
      id: '1',
      title: ctx.req.body.title,
      completed: false
    });
    this.redirect('/all');
  }
});

var App = React.createClass({

  add: function (evt) {
    evt.preventDefault();
    var title = this.refs.input.getDOMNode().value.trim();
    if (title) {
      this.props.router.post('/add', {title: title});
    }
  },

  render: function () {
    var state = this.props.router.state;
    return (
      <div>
        <pre>{JSON.stringify(state, null, 2)}</pre>
        {/* if JavaScript is disabled, fallback to old style form POST */}
        <form action="/add" method="POST">
          <input type="text" ref="input"/>
          {/* if JavaScript is enabled, progressive enhancement */}
          <button onClick={this.add}>Add</button>
        </form>
      </div>
    );
  }

});

module.exports = router;
```

client.js

```js
var React = require('react');
// the same router for client-side and server-side
var router = require('./myrouter');
var HistoryLocation = require('tom/lib/HistoryLocation');

// configure state (`windows`? see "Server side rendering")
router.state = window.state;

// configure rendering
router.render = function (renderable) {
  React.render(renderable, document.getElementById('app'));
};

// configure location (main entry point)
new HistoryLocation(router).start();
```

# Server side rendering

server.js

```js
var app = express();
// the same router for client-side and server-side
var router = require('./myrouter');

// catch all route
app.get('/*', function (req, res) {
  // define the logic to retrive the user state
  router.getState = function () {
    return {...};
  };
  router.render = function (renderable) {
    res.render('index', {
      ui: React.renderToString(renderable),
      // send the state to the client
      state: JSON.stringify(router.state)
    });
  };
  // dispatch
  router.get(req.originalUrl);
});
```

index.html

```html
<body>
  <div id="app"><%= ui %></div>
  <script>
  var state = <%= state %>;
  </script>
  <script src="client.js"></script>
</body>
```

# Handling nested views

```js
var App = React.createClass({
  render: function () {
    return (
      <div>
        {this.props.children}
      </div>
    );
  }
});

var Nested = React.createClass({
  render: function () {
    return (
      <div>
        nested route
      </div>
    );
  }
});

router.route({
  method: 'GET',
  path: '/(.*)',
  handler: function (ctx) {
    // just add the partials in reverse order
    ctx.partials = [App];
    ctx.next();
  }
});

router.route({
  method: 'GET',
  path: '/nested',
  handler: function (ctx) {
    var Renderable = ctx.partials.reduce(function (view, Partial) {
      return <Partial>{view}</Partial>;
    }, <Nested />);
    this.render(Renderable);
  }
});
```

# API

## Request

A `Request` is an (immutable) object containing the data associated to a url call:

```js
// call: GET /user/1/projects?sort=asc
{
  method: "GET" | "POST",
  url: Str,   // "/user/1/projects?sort=asc"
  path: Str,  // "/user/1/projects"
  query: Obj, // {sort: 'asc'}
  body: ?Obj  // only for POSTs
}
```

### Request.of

Helper `Request` factory that handles the `path` field:

```js
(method: Method, url: Str, body: ?Obj) => Request
```

## Context

A `Context` is an object passed in a route handler:

```js
// example:
// route path: /user/:userId/projects?sort=asc
// call: GET /user/1/projects?sort=asc
{
  req: Request,
  params: Obj, // contains the path params: {userId: '1'}
  next(): () => Nil // exec next middleware
}
```

## Router

```js
var Router = require('tom/lib/Router');
var router = new Router({
  matcher: (t.Str) => ((t.Str) => ?t.Obj)
  emitter: EventEmitter
});
```

### matcher

A function with the following signature:

```js
function matcher(path) {
  return function match(url) {
    // return the path params hash if match succeded,
    // otherwise `null`
  };
}
```


### Defining a route

```js
router.route({
  method: "GET" | "POST",
  path: Str,
  // function (ctx: Context) {}, `this` is the router
  handler: (Context) => Nil
});
```

### Dispatching

```js
router.dispatch(req: Request)
```

### Calling

```js
get(url: Str)
post(url: Str, body: ?Obj)
redirect(path: Str, params: ?Obj, query: ?Obj)
```

### Events

```js
router.emitter.on('dispatch', function (req: Request) {
  // req: the dispatched Request
});
```

### Debugging

```js
// the module debug is exported
t.om.debug.enable('Router');
```
