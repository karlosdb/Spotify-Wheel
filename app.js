const data = require('./data')
const sp = require('./spotify')
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

app.get('/accessToken', (req, res) => {
  res.json(sp.accessToken);
});

app.get('/spotifyLogin', (req, res) => {
  res.redirect(sp.spotifyApi.createAuthorizeURL(sp.scopes));
});

app.get('/callback', (req, res) => {
  const error = req.query.error;
  const code = req.query.code;
  const state = req.query.state;

  if (error) {
    console.error('Callback Error:', error);
    res.send(`Callback Error: ${error}`);
    return;
  }

  sp.spotifyApi
    .authorizationCodeGrant(code)
    .then(data => {
      const access_token = data.body['access_token'];
      const refresh_token = data.body['refresh_token'];
      const expires_in = data.body['expires_in'];

      sp.spotifyApi.setAccessToken(access_token);
      sp.spotifyApi.setRefreshToken(refresh_token);

      console.log('access_token:', access_token);
      console.log('refresh_token:', refresh_token);

      console.log(
        `Sucessfully retreived access token. Expires in ${expires_in} s.`
      );
      res.redirect('/dashboard') // after loggin in, redirect back to dashboard

      setInterval(async () => {
        const data = await sp.spotifyApi.refreshAccessToken();
        const access_token = data.body['access_token'];
        //sp.accessToken = access_token; // set access token in spotify.js

        console.log('The access token has been refreshed!');
        console.log('access_token:', access_token);
        sp.spotifyApi.setAccessToken(access_token);
      }, expires_in / 2 * 1000);
    })
    .catch(error => {
      console.error('Error getting Tokens:', error);
      res.send(`Error getting Tokens: ${error}`);
    });
});

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
  client.connect(err => {
    const collection = client.db("db").collection("songs");
    collection.find({ [playlist] : { $exists : true } }).toArray(function(err, result) {
      res.json(Object.values(result[0])[1]);
    });
  });
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

