var express = require('express');
var router = express.Router();

app.use(express.static("public"))

/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile('/app/index.html');
});

router.get('/styles.css', function(req, res, next) {
  res.sendFile('/app/styles.css');
});

module.exports = router;
