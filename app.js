var express = require('express');
var path = require('path');
var app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.get('/dashboard', function(req, res, next) {
  res.sendFile(path.join(__dirname, 'public/dashboard.html'));
});

app.get('/comments', function(req, res, next) {
  res.sendFile(path.join(__dirname, 'public/comments.html'));
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}

app.listen(port, () => {
  console.log(`Spotify Wheel listening on port ${port}`)
});

module.exports = app;
