const data = require('./data')
var express = require('express');
var path = require('path');
var app = express();

const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

let secrets;
let uri;
if (!process.env.URI) {
  secrets = require('./secrets.json');
  uri = secrets.uri
} else {
	uri = process.env.URI;
}

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname, 'public/login.html'));
});

app.get('/dashboard', function(req, res, next) {
  res.sendFile(path.join(__dirname, 'public/dashboard.html'));
});

app.get('/comments', function(req, res, next) {
  res.sendFile(path.join(__dirname, 'public/comments.html'));
});

//api calls

app.get('/api/save_comment', (req, res) => {
  res.json('saved comment');
})

app.get('/api/add_song', async (req, res) => {
  client.connect(err => {
    const collection = client.db("db").collection("users");
    // perform actions on the collection object
    collection.insertOne({user: "Kevin", pass:"pass"}, () => client.close());
  });
  res.json('added song');
})

app.get('/api/remove_song', (req, res) => {
  client.connect(err => {
    const collection = client.db("db").collection("users");
    // perform actions on the collection object
    collection.deleteMany({}, () => client.close());
  });
  res.json('removed song');
})

app.get('/api/move_song', (req, res) => {
  res.json('updated song');
})

app.get('/api/current_song', (req, res) => {
  res.json(data.current_song);
})

app.get('/api/playlists', (req, res) => {
  res.json(data.playlists);
})

app.get('/api/get_songs/:playlist/', (req, res) => {
  const playlist = req.params.playlist;
  res.json(data.songs[playlist]);
})

app.get('/login=&login=', (req, res) => {
  console.log('hi')
  res.redirect('/dashboard');
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}

app.listen(port, async () => {
  console.log(`Spotify Wheel listening on port ${port}`)
});

module.exports = app;

