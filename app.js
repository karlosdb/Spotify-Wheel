const path = require("path");
const data = require("./data");

const express = require("express");
const app = express();
const minicrypt = require("./miniCrypt").MiniCrypt;

const { spotifyApi, scopes } = require("./spotify");

let userID;

require("dotenv").config();

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

let secrets;
let uri;

if (!process.env.URI) {
  secrets = require("./secrets.json");
  uri = secrets.URI;
} else {
  uri = process.env.URI;
}

// *** PASSPORT ***
const passport = require("passport");
const session = require("express-session");
passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((uid, done) => {
  done(null, uid);
});

// how we authenticate users
const LocalStrategy = require("passport-local").Strategy;

// *** APP SETUP ***
app.use(
  session({
    secret: process.env.SECRET || "SECRET",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true })); // allow URLencoded data
app.use(express.json());

const { MongoClient, ServerApiVersion } = require("mongodb");

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

client.connect().then((db) => {
  db = db.db("db");
  const mc = new minicrypt();

  //*** DB HELPERS ***
  const addUser = async (username, password) => {
    if (await findUser(username)) return false;
    const [salt, hash] = mc.hash(password);
    const users = db.collection("users");
    return await users.insertOne({ username, salt, hash });
  };

  const findUser = async (username) => {
    const users = db.collection("users");
    return await users.findOne({ username: username });
  };

  // *** PASSPORT and LOGIN and USER CREATION ***
  const strategy = new LocalStrategy(async (username, password, done) => {
    const found = await findUser(username);

    if (!found || !mc.check(password, found.salt, found.hash)) {
      await new Promise((r) => setTimeout(r, 1000));
      return done(null, false, { message: "Wrong username or password" });
    }

    done(null, username);
  });

  // no idea if you're suppposed to do this here
  passport.use(strategy);

  app.post(
    "/login",
    passport.authenticate("local", {
      successRedirect: "/spotifyLogin",
      failureRedirect: "/",
    })
  );

  app.post("/api/checkUsername", async (req, res) => {
    const { username } = req.body;
    res.json({ success: (await findUser(username)) == null });
  });

  app.post("/register", async (req, res) => {
    const { username, password } = req.body;
    if (await addUser(username, password)) {
      res.redirect("/");
    }
  });

  const checkAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect("/");
  };

  const checkLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) return res.redirect("/spotifyLogin");
    next();
  };

  app.get("/logout", checkAuthenticated, (req, res) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      } else {
        res.redirect("/");
      }
    });
  });

  // *** SPOTIFY ***
  app.get("/spotifyLogin", (req, res) => {
    res.redirect(spotifyApi.createAuthorizeURL(scopes));
  });

  app.get("/callback", (req, res) => {
    const error = req.query.error;
    const code = req.query.code;
    if (error) {
      console.error("Callback Error:", error);
      res.send(`Callback Error: ${error}`);
      return;
    }

    spotifyApi
      .authorizationCodeGrant(code)
      .then(async (data) => {
        const access_token = data.body["access_token"];
        const refresh_token = data.body["refresh_token"];
        const expires_in = data.body["expires_in"];

        spotifyApi.setAccessToken(access_token);
        spotifyApi.setRefreshToken(refresh_token);


      console.log(
        `Sucessfully retreived access token. Expires in ${expires_in} s.`
      );

      
      res.redirect("/dashboard"); // after loggin in, redirect back to dashboard

      setInterval(async () => {
        const data = await spotifyApi.refreshAccessToken();
        access_token = data.body["access_token"];
        spotifyApi.setAccessToken(access_token);
      }, (expires_in / 2) * 1000);
    })
    .catch((error) => {
      console.error("Error getting Tokens:", error);
      res.send(`Error getting Tokens: ${error}`);
    });
  });

  // *** ROUTES ***
  app.get("/", checkLoggedIn, function (req, res, next) {
    res.sendFile(path.join(__dirname, "public/login.html"));
  });

  app.get("/dashboard", checkAuthenticated, function (req, res, next) {
    res.sendFile(path.join(__dirname, "public/dashboard.html"));
  });

  app.get("/comments", checkAuthenticated, function (req, res, next) {
    res.sendFile(path.join(__dirname, "public/comments.html"));
  });

  app.get("/api/playlists", async (req, res) => {
    await spotifyApi.getMe().then(async (data) => {
      res.json((await spotifyApi.getUserPlaylists()).body.items
        .filter((playlist) => playlist.owner.id === data.body.id)
        .map((playlist) => {
          return [playlist.name, playlist.id];
        })
      )
    });
  });

  app.get("/api/get_songs/:playlist/", async (req, res) => {
    spotifyApi.getPlaylist(req.params.playlist)
      .then((data) => {
        res.json(data.body.tracks.items.map((track) => track.track.name));
      }, function(err) {
        console.log('Something went wrong!', err);
      });
  })

  

  // *** API CALLS ***
  app.post("/api/save_comment", checkAuthenticated, async (req, res) => {
    const { comment, song_id } = req.body.comment;
    db.collection("comments")
      .insertOne({ comment, song_id, user: req.user })
      .then((_) => res.status(200))
      .catch(console.err);
  });

  app.post("/api/get_comments", checkAuthenticated, async (req, res) => {
    const { song_id } = req.body;
    res.json(await db.collection("comments").find({ song_id }).toArray());
  });

  app.get("/api/get_playlists", checkAuthenticated, async (req, res) => {
    const ID = (await spotifyApi.getMe()).body.id
    spotifyApi.getUserPlaylists().then(response => response.body.items).then(playlists => {
      res.json(playlists.filter(playlist => playlist.owner.id === ID))
    })
  });


  // *** SPOTIFY HELPERS ***
  const remove_song = async (song_id, playlist_id) => {
    await spotifyApi.removeTracksFromPlaylist(playlist_id, [{ uri: song_id }]).then(() => {
      res.sendStatus(200);
    }).catch(console.err);
  }

  const add_song = async (song_id, playlist_id) => {
    await spotifyApi.addTracksToPlaylist(playlist_id, [song_id]).then(() => {}).catch(console.err);
  }

  app.post("api/remove_song", checkAuthenticated, async (req, res) => {
    const { song_id, playlist_id } = req.body;
    await remove_song(song_id, playlist_id);
    res.send(200)
  })

  app.post("/api/add_song", checkAuthenticated, async (req, res) => {
    const [song_uri, playlist_id] = req.body;
    await add_song(song_uri, playlist_id);
    res.send(200);
  });

  app.post("/api/move_song", checkAuthenticated, async (req, res) => {
    const { song_id, source_playlist_id, dest_playlist_id } = req.body;
    await remove_song(song_id, source_playlist_id);
    await add_song(song_id, dest_playlist_id);
    res.send(200);
  })
  
  app.get("/api/resume_player", async (req, res) => {
    spotifyApi.play().then((_) => res.json("Resumed Player")).catch(console.err);
  })

  app.get("/api/pause_player", async (req, res) => {
    spotifyApi.pause().then((_) => res.json("Paused Player")).catch(console.err);
  })

  app.get("/api/skip_to_next_track", async (req, res) => {
    spotifyApi.skipToNext().then((_) => res.json("Skipped To Next Track")).catch(console.err);
  })

  app.get("/api/skip_to_previous_track", async (req, res) => {
    spotifyApi.skipToPrevious().then((_) => res.json("Skipped To Previous Track")).catch(console.err);
  })

  app.get("/api/get_currently_playing_track_info", (req, res) => {
    spotifyApi.getMyCurrentPlayingTrack().then(data => {
      if (data.body.item === undefined) {
        res.json({ name: "No Song Playing", artist: "", imageURL: "", uri: "" })
      } else {
        res.json({
          name: data.body.item.name,
          artist: data.body.item.artists[0].name,
          imageURL: data.body.item.album.images[0].url,
          uri: data.body.item.uri
        });
      }
    }).catch(console.err);
  })

  let port = process.env.PORT;

  if (port == null || port == "") {
    port = 8000;
  }

  app.listen(port, async () => {
    console.log(`Spotify Wheel listening on port ${port}`);
  });
});

module.exports = app;
