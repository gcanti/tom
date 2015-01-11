A complete routing library <del>for React</del>.

**Work In progress...**

# Features

- hapijs like api for routes definition
- runs both on browser and on server
- configurable state management
- configurable ui target
- simple nested ui management (a la react-router)
- configurable location (hashchange, popstate)
- configurable path to regexp implementation
- simple api:
  - `route(options)`
  - `get(url)`
  - `post(url, body?)`
  - `render(renderable)`
- lightweight

# Gist

myrouter.js

```js
var React = require('react');
var Router = require('tom/lib/Router');
var matcher = require('tom/lib/matcher');
var EventEmitter = require('eventemitter3');

var router = new Router({
  matcher: matcher,
  emitter: new EventEmitter()
});

//
// route definition
//

router.route({
  method: 'GET',
  path: '/all',
  handler: function (ctx) {
    this.render(<App router={this} />);
  }
});

router.route({
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

//
// ui definition
//

var App = React.createClass({

  addTodo: function () {
    var title = this.refs.input.getDOMNode().value.trim();
    if (title) {
      this.props.router.post('/add', {title: title});
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

module.exports = router;
```

client.js

```js
var React = require('react');
var router = require('./myrouter');

// initialise state
// windows? see "Server side rendering"
router.state = window.state || [];

// configure ui target
router.render = function (renderable) {
  React.render(renderable, document.getElementById('app'));
};

```

# Server side rendering

server.js

```js
var app = express();
var router = require('./myrouter');

// define the logic to retrive the user state
var getStateByUser = ...

// catch all route
app.get('/*', function (req, res) {
  router.state = getStateByUser(req.cookies.id);
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

# Demo

```
git clone https://github.com/gcanti/tom.git
cd tom
npm install
npm run demo
```

# API

## Request

A `Request` is an (immutable) object containing the data associated to a url call:

```js
// call: GET /user/1/projects?sort=asc
{
  method: "GET" | "POST",
  url: t.Str,          // "/user/1/projects?sort=asc"
  path: t.Str,         // "/user/1/projects"
  query: t.Obj,        // {sort: 'asc'}
  body: t.maybe(t.Obj) // only for POSTs
}
```

### Request.of(method, url, body)

Helper `Request` factory (handles the `path` field).

## Context

A `Context` is an object passed in a route handler:

```js
// route path: /user/:userId/projects?sort=asc
// call: GET /user/1/projects?sort=asc
{
  req: Request,
  params: t.Obj, // contains the path params: {userId: '1'}
  next() // exec next middleware
}
```

## Router

```js
var Router = require('tom/Router');
// default path to regexp implementation
var matcher = require('tom/lib/matcher');
var router = new Router(matcher);
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
  path: t.Str,
  // function (ctx: Context) {}, `this` is the router
  handler: t.func(Context, Nil)
});
```

### Dispatching

```js
router.dispatch(req: Request)
```

### Calling

```js
get(url: Str)
post(url: Str, body: t.maybe(t.Obj))
redirect(path: t.Str, params: t.maybe(t.Obj), query: t.maybe(t.Obj))
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
router.debug.enable('Router');
```
