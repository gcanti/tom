# State

The entire app state should be immutable, contained in one single point and passed in as `req.session`.

# Routing

```js
var app = tom();

// typed session
var Session = t.struct({
  ...
});

// route definition
app.route({

  method: 'GET', // 'GET' or 'POST'

  path: '/users/:userId/projects', // params start with ':'

  // typed params
  params: t.struct({
    userId: t.Str
  }),

  // typed querystring
  query: t.struct({
    sort: t.enums.of('asc desc')
  }),

  handler: function (req, res, next) {

    // * REQUEST *
    req.method; // => 'GET'
    req.url; // => '/users/1/projects?sort=asc'
    req.params; // => {userId: '1'} (immutable)
    req.query; // => {sort: 'asc'} (immutable)
    req.body; // {...} if method === 'POST'

    req.session; // app state (immutable)

    // req is mutable
    req.user = new User();

    // * RESPONSE *
    // exec next middleware..
    next();
    // ..or render..
    res.render(<MyComponent />);
    // ..or update session..
    res.update(spec);
    // or redirect
    res.redirect(url); // same req
  }
});

// route call
app.get('/users/1/projects?sort=asc');
app.post('/users', body);

// start the application
app.run(function (renderable) {
  React.render(renderable, document.body);
});

```
