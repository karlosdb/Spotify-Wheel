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
  res.json('added song');
})

app.get('/api/remove_song', (req, res) => {
  client.connect(err => {
    const collection = client.db("db").collection("users");
    collection.deleteMany({}, () => client.close());
  });
  res.json('removed song');
})

app.get('/api/move_song', (req, res) => {
  client.connect(err => {
    const collection = client.db("db").collection("users");
    collection.updateOne(
      {user: "Kevin"},
      {
        $set: { "logins" : 3 }
      }
    )
  });
  res.json('updated song');
});

app.get('/api/current_song', (req, res) => {
  client.connect(err => {
    const collection = client.db("db").collection("users");
    collection.find({}).toArray(function(err, result) {
      if (err) throw err;
      res.json(result);
    });
  });
})

app.get('/api/playlists', (req, res) => {
  // res.json(data.playlists);
  client.connect(err => {
    let playlists = [];
    const collection = client.db("db").collection("songs");
    collection.find({}).toArray(function(err, result) {
      if (err) throw err;
      res.json(result.map((x) => {
        return Object.keys(x)[1];
      }));
      
    });
  });
})

app.get('/api/get_songs/:playlist/', (req, res) => {
  const playlist = req.params.playlist;
  // client.connect(err => {
  //   const collection = client.db("db").collection("songs");
  //   collection.find({playlist}).toArray(function(err, result) {
  //     if (err) throw err;
  //     res.json(result);
  //   });
  // });
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

