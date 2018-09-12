
///////node libraries into the file using require()///////
var createError = require('http-errors');
var express = require('express');  //輸入express這個模組
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var compression = require("compression");
var helmet = require("helmet");


app.use(compression()); // Compress all routes, set up before route code
app.use(helmet());


//route 
var indexRouter = require('./routes/index');   //從同一層的routes資料夾輸入index.js module
var usersRouter = require('./routes/users');   //這裡要輸入users.js的這個模組，js可以選擇性省略
var catalogRouter = require('./routes/catalog');  //Import routes for "catalog" area of site



var app = express();   //輸入變數app, 後面都會用到，最重要的物件


//Set up mongoose connection
//creates the default connection to the database and 
//binds to the error event (so that errors will be printed to the console). 
var mongoose = require('mongoose');
var mongoDB = 'mongodb://re4388:211aoxjgju@ds149732.mlab.com:49732/local_library';
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));




/* view engine setup */
//要設定兩個值，一個是template的路徑directory，一個是哪種view引擎，由file extension定義
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


/*call app.use() to add the middleware libraries into the request handling chain */
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

//after middleware is set up, set up route-handling code 
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/catalog', catalogRouter);  // Add catalog routes to middleware chain.


// ('/' and '/users') are treated as a prefix to routes defined in the imported files
//for example if the imported users module defines a route for /profile, 
//you would access that route at /users/profile. 




/*
The last middleware in the file adds handler methods for errors and HTTP 404 responses.
 */

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

/**
 * The last step is to add it to the module exports 
 * (this is what allows it to be imported by /bin/www).
 */
module.exports = app;
