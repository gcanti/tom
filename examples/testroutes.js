var Router = require('../lib/Router');


function home(context) {

console.log("home: " + context); 

}

function user(context) {
  var userId = context.params.id;
  console.log("user: " + context); 
}






var router = new Router({
  '/home': home,
  '/user/:id': user
});

router.dispatch('/user/123?q=1', { myvalue: 1 });


