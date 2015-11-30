var Router = require('../lib/Router');


function userMiddleware(next) {
  return function (context) {
    context.user = {id: context.params.id};
    next(context);
  };
}

function user(context) {
  console.log(context.user); // will output { id: '123' }
}

var router = new Router({
  '/user/:id': userMiddleware(user)
});

router.dispatch('/user/123');

