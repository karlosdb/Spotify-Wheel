const data = require('./data')
var express = require('express');
var path = require('path');
var app = express();
var SpotifyWebApi = require('spotify-web-api-node');

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

// SPOTIFY SHITTTTTTTTTTTT
const scopes = [
  'ugc-image-upload',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'streaming',
  'app-remote-control',
  'user-read-email',
  'user-read-private',
  'playlist-read-collaborative',
  'playlist-modify-public',
  'playlist-read-private',
  'playlist-modify-private',
  'user-library-modify',
  'user-library-read',
  'user-top-read',
  'user-read-playback-position',
  'user-read-recently-played',
  'user-follow-read',
  'user-follow-modify'
];

var spotifyApi = new SpotifyWebApi({
  clientId: '9923775e49b54d5dad3b5b291d7790b5',
  clientSecret: '2fd4c770741642628cdf09fc522969ea',
  redirectUri: 'http://localhost:8000/callback'
});


app.use(express.static(path.join(__dirname, 'public')));

app.get('/spotifyLogin', (req, res) => {
  res.redirect(spotifyApi.createAuthorizeURL(scopes));
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

  spotifyApi
    .authorizationCodeGrant(code)
    .then(data => {
      const access_token = data.body['access_token'];
      const refresh_token = data.body['refresh_token'];
      const expires_in = data.body['expires_in'];

      spotifyApi.setAccessToken(access_token);
      spotifyApi.setRefreshToken(refresh_token);

      console.log('access_token:', access_token);
      console.log('refresh_token:', refresh_token);

      console.log(
        `Sucessfully retreived access token. Expires in ${expires_in} s.`
      );
      res.send('Success! You can now close the window.');

      setInterval(async () => {
        const data = await spotifyApi.refreshAccessToken();
        const access_token = data.body['access_token'];

        console.log('The access token has been refreshed!');
        console.log('access_token:', access_token);
        spotifyApi.setAccessToken(access_token);
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

// app.get('/login=&login=', (req, res) => {
//   console.log('hi')
//   res.redirect('/dashboard');
// });

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}

app.listen(port, async () => {
  console.log(`Spotify Wheel listening on port ${port}`)
});

module.exports = app;

