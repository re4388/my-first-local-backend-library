/*****Defining and using separate route modules****/
// wiki.js - Wiki route module.

var express = require('express');  //imports the Express application object
var router = express.Router();


// Home page route.
router.get('/', function (req, res) {
    res.send('Wiki home page');
})

// About page route.
router.get('/about', function (req, res) {
    res.send('About this wiki');
})

module.exports = router;

// Above we are defining our route handler callbacks directly in the router functions


//below is for main app file

var wiki = require('./wiki.js');
// ...
app.use('/wiki', wiki);

//The two routes defined in module are then accessible from wiki / and / wiki / about /


/*****Route functions
 * 
 * 結構
 * app.METHOD(PATH, HANDLER)

Router functions are Express middleware, which means that they must either complete
(respond to) the request or call the next function in the chain. 
In the case above we complete the request using send(), 
so the next argument is not used (and we choose not to specify it).
The  router function above takes a single callback, 
but you can specify as many callback arguments as you want, or an array of callback functions. 
Each function is part of the middleware chain, and will be called in the order it is added 
to the chain (unless a preceding function completes the request).

The callback function here calls send() on the response to return the string "About this wiki" 
when we receive a GET request with the path ('/about').

******/

router.get('/about', function (req, res) {
    res.send('About this wiki');
})

/*****HTTP verbs
 * 
 * 
 * The Router also provides route methods for all the other HTTP verbs, that are mostly used 
 * in exactly the same way: post(), put(), delete(), options(), trace(), copy(), lock(), 
 * mkcol(), move(), purge(), propfind(), proppatch(), unlock(), report(), ​​​​​​ mkactivity(), 
 * checkout(), merge(), m-search(), notify(), subscribe(), unsubscribe(), patch(), search(), 
 * and connect().
 * 
 * 
 * ******/

 
router.post('/about', function (req, res) {
  res.send('About this wiki');
})


/*****sectionRoute****
 * 
 * The route paths define the endpoints at which requests can be made
 * 
 * The examples we've seen so far have just been strings, and are used exactly as written: 
 * '/', '/about', '/book', '/any-random.path'.
 * 
 * Route paths can also be string patterns.
 * 
 *  ? : The endpoint must have 0 or 1 of the preceding character. 
 * E.g. a route path of '/ab?cd' will match endpoints acd or abcd.
 * 
 *  + : The endpoint must have 1 or more of the preceding character. 
 * E.g. a route path of '/ab+cd' will match endpoints abcd, abbcd, abbbcd, and so on.
 * 
 *   * : The endpoint may have an arbitrary string where the * character is placed. 
 * E.g. a route path of 'ab\*cd' will match endpoints abcd, abXcd, abSOMErandomTEXTcd, and so on.
 * 
 *  () : Grouping match on a set of characters to perform another operation on. 
 * E.g. '/ab(cd)?e' will peform a ? match on (cd) —it will match abe and abcde.
 * 
 * **/




/*****Route parameters
 * 
 * 
 * The named segments are prefixed with a colon and then the name (e.g. /:your_parameter_name/. 
 * The captured values are stored in the req.params object using the parameter names as keys
 * 
 * The names of route parameters must be made up of “word characters” (A-Z, a-z, 0-9, and _).
 * 
 * 
 * consider: http://localhost:3000/users/34/books/8989
 * ******/

app.get('/users/:userId/books/:bookId', function (req, res) {
    // Access userId via: req.params.userId
    // Access bookId via: req.params.bookId
    res.send(req.params);
})





/*****Route******/
/*****Route******/







