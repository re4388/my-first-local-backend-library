
// First it loads the express module, and uses it to get an express.Router object.
var express = require('express');
var router = express.Router();


/* 
GET users listing. 
這裡定義了收到了HTTP要如何回應
router 定義一個callback f, 只要有http request進來且偵測到正確的pattern，就會run下面指令
這裡的pattern很簡單，這個路徑會run只要收到此url path:    /users/ 

PS: 還有的三個argument, next, 所以你後面才可以加上其他route handler
*/


router.get('/', function(req, res, next) {
  res.send("You are entering the users folder");
});

router.get('/cool', function (req, res, next) {
  res.send("You're so cool");
});


//模組輸出 for app.js
module.exports = router;
