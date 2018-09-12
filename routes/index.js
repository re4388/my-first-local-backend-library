var express = require('express');
var router = express.Router();

/* 
GET home page. 

首頁路徑index route定義了使用哪一個template(index.pug)和template變數title
*/

// router.get('/', function(req, res, next) {
//   res.render('index', { title: "Ben's Express" });
// });

// GET home page.
router.get('/', function (req, res) {
  res.redirect('/catalog');
});

module.exports = router;
