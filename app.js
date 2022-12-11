const data = require('./data')
var express = require('express');
var path = require('path');
var app = express();
var SpotifyWebApi = require('spotify-web-api-node');

require("dotenv").config();

let secrets;
let uri;

if (!process.env.URI) {
  secrets = require("./secrets.json");
  uri = secrets.URI;
} else {
  uri = process.env.URI;
}



// *** HELLA NICE HELPER FUNCTION ***
const getMethods = (obj) => {
  let properties = new Set();
  let currentObj = obj;
  do {
    Object.getOwnPropertyNames(currentObj).map((item) => properties.add(item));
  } while ((currentObj = Object.getPrototypeOf(currentObj)));
  return [...properties.keys()].filter(
    (item) => typeof obj[item] === "function"
  );
};

app.use(express.static(path.join(__dirname, "public")));

const { MongoClient, ServerApiVersion } = require("mongodb");
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
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
      console.error("Callback Error:", error);
      res.send(`Callback Error: ${error}`);
      return;
    }

    sp.spotifyApi
      .authorizationCodeGrant(code)
      .then((data) => {
        const access_token = data.body["access_token"];
        const refresh_token = data.body["refresh_token"];
        const expires_in = data.body["expires_in"];

        sp.spotifyApi.setAccessToken(access_token);
        sp.spotifyApi.setRefreshToken(refresh_token);

        console.log("access_token:", access_token);
        console.log("refresh_token:", refresh_token);

        console.log(
          `Sucessfully retreived access token. Expires in ${expires_in} s.`
        );
        res.redirect("/dashboard"); // after loggin in, redirect back to dashboard

        setInterval(async () => {
          const data = await sp.spotifyApi.refreshAccessToken();
          const access_token = data.body["access_token"];
          //sp.accessToken = access_token; // set access token in spotify.js

          console.log("The access token has been refreshed!");
          console.log("access_token:", access_token);
          sp.spotifyApi.setAccessToken(access_token);
        }, (expires_in / 2) * 1000);
      })
      .catch((error) => {
        console.error("Error getting Tokens:", error);
        res.send(`Error getting Tokens: ${error}`);
      });
  });

  // *** ROUTES ***
  app.get("/", function (req, res, next) {
    res.sendFile(path.join(__dirname, "public/login.html"));
  });

  app.get("/dashboard", function (req, res, next) {
    res.sendFile(path.join(__dirname, "public/dashboard.html"));
  });

  app.get("/comments", function (req, res, next) {
    res.sendFile(path.join(__dirname, "public/comments.html"));
  });

  // *** API CALLS ***
  app.get("/api/save_comment", (req, res) => {
    db.collection("users")
      .insertOne({ test: "test" })
      .then((_) => {
        res.json("saved comment");
      })
      .catch(console.err);
  });

  app.get("/api/add_song", async (req, res) => {
    res.json("added song");
  });

  app.get("/api/remove_song", (req, res) => {
    db.collection("users").deleteMany({})
      .then((_) => res.json("removed song"))
      .catch(console.err);
  });

  app.get("/api/move_song", (req, res) => {
    db.collection("users").updateOne({ user: "Kevin" }, { $set: { logins: 3 } })
      .then((_) => res.json("updated song"))
      .catch(console.err);
  });

  app.get("/login=&login=", (req, res) => {
    res.redirect("/dashboard");
  });



  let port = process.env.PORT;
  if (port == null || port == "") {
    port = 8000;
  }

  app.listen(port, async () => {
    console.log(`Spotify Wheel listening on port ${port}`);
  });


module.exports = app;
