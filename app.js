const path = require("path");
const data = require("./data");

const express = require("express");
const app = express();
const minicrypt = require('./miniCrypt').MiniCrypt;

const {spotifyApi, scopes} = require('./spotify');
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

  app.post("/login", passport.authenticate('local', {
    successRedirect: "/spotifyLogin",
    failureRedirect: "/",
  }));



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

  app.get("/logout", checkLoggedIn, (req, res) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.redirect("/");
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
          access_token = data.body["access_token"];
          const refresh_token = data.body["refresh_token"];
          const expires_in = data.body["expires_in"];

          spotifyApi.setAccessToken(access_token);
          spotifyApi.setRefreshToken(refresh_token);
          
          await spotifyApi.getMe().then(function (data) {
            userID = data.body.id;
          });

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

  // *** API CALLS ***
  app.get("/api/save_comment", (req, res) => {
    db.collection("users")
      .insertOne({ user })
      .then((_) => res.json("saved comment"))
      .catch(console.err);
  });


  app.get("/api/playlists", async (req, res) => {
    const data = await spotifyApi.getUserPlaylists(userID);
    res.json(data.body.items
      .filter((playlist) => playlist.owner.id === userID)
      .map((playlist) => {
        return [playlist.name, playlist.id];
      })
    );
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
