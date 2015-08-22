var tape = require('tape');
var Router = require('../lib/Router');

tape('Route', function (t) {

  var Route = Router.Route;

  t.test('should not match a url', function (assert) {
    assert.plan(1);
    var route = new Route('/home', function () {
    });
    var match = route.match('/bad');
    assert.strictEqual(match, null);
  });

  t.test('should match a url', function (assert) {
    assert.plan(2);
    var route = new Route('/home', function () {
    });
    var match = route.match('/home');
    assert.strictEqual(match instanceof Router.Match, true);
    assert.deepEqual(match.context, { path: '/home', params: {}, query: {} });
  });

  t.test('should retrieve url params', function (assert) {
    assert.plan(1);
    var route = new Route('/user/:id', function (context) {
      assert.deepEqual(context, { path: '/user/1', params: { id: '1' }, query: {} });
    });
    route.match('/user/1').run();
  });

  t.test('should retrieve query params', function (assert) {
    assert.plan(1);
    var route = new Route('/home', function (context) {
      assert.deepEqual(context, { path: '/home', params: {}, query: { q: '1' } });
    });
    route.match('/home?q=1').run();
  });

  t.test('should handle a context', function (assert) {
    assert.plan(1);
    var route = new Route('/home', function (context) {
      assert.deepEqual(context, { path: '/home', params: {}, query: {}, a: 1 });
    });
    route.match('/home', { a: 1 }).run();
  });

});

tape('Router', function (t) {

  t.test('should be configured', function (assert) {
    assert.plan(1);

    var router = new Router({
      '/home': function () {
        assert.end();
      }
    });
    assert.strictEqual(router.routes.length, 1);
  });

  t.test('should dispatch a url', function (assert) {
    assert.plan(0);

    var router = new Router({
      '/home': function () {
        assert.end();
      }
    });
    router.dispatch('/home');
  });

  t.test('should handle a context', function (assert) {
    assert.plan(1);

    var router = new Router({
      '/home': function (context) {
        assert.deepEqual(context, { path: '/home', params: {}, query: {}, a: 1 });
      }
    });
    router.dispatch('/home', { a: 1 });
  });

});
