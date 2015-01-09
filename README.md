A complete routing library <del>for React</del>.

# Features

- express-like routing concept
- runs both on browser and on server
- configurable state management
- configurable ui target (React, ...)
- configurable nested ui management
- configurable location (hashchange, popstate)
- configurable path to regexp implementation
- simple api:
  - `route(spec)`
  - `run(callback)`
  - `get(url)`
  - `post(url, [body])`

# Example

```js
var React = require('react');
var t = require('tom');

//
// configurable state management
//

var Todo = t.struct({
  id: t.Str,
  title: t.Str,
  completed: t.Bool
});
var State = t.list(Todo);
var state = State([]);

//
// express-like routing concept
//

var app = new t.om.App();

// get all todos
app.route({
  method: 'GET', path: '/all',
  handler: function (ctx) {
    ctx.res.render(<App state={state} />);
  }
});

// add a todo
app.route({
  method: 'POST', path: '/add',
  handler: function (ctx) {
    var todo = new Todo({
      id: '1',
      title: ctx.req.body.title,
      completed: false
    });
    state = State.update(state, {'$push': [todo]});
    ctx.res.redirect('/all');
  }
});

//
// configurable ui target
//

app.run(function (renderable) {
  React.render(renderable, document.getElementById('app'));
});

var App = React.createClass({

  addTodo: function () {
    var title = this.refs.input.getDOMNode().value.trim();
    if (title) {
      app.post('/add', {title: title});
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

//
// configurable location
//

// listen to hash changes
window.onhashchange = function () {
  app.get(location.hash.substr(1));
};

// first rendering
if (location.hash) {
  window.onhashchange();
} else {
  location.hash = '/all';
}
```

# API

## Request

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

## Response

```js
{
  redirect(url: t.Str), // same as app.get(url)
  render(renderable: t.Any)
}
```

## Context

```js
{
  req: Request,
  res: Response,
  params: t.Obj, // contains the path params
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

### Defining a route

```js
router.route({
  method: "GET" | "POST",
  path: t.Str,
  handler: t.Func // function (ctx: Context) {}
});
```

### Dispatching

```js
router.dispatch(req: Request, res: Response)
```

## App

```js
var t = require('tom');
var matcher = require('tom/lib/matcher');
var app = new t.om.App(matcher);
```

Implements `Router` and:

```js
get(url: Str)
post(url: Str, body: ?Obj)
run(onRender(renderable: Any))
```
