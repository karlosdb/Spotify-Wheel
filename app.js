const path = require('path');
const data = require('./data')

const express = require('express');
const app = express();

const SpotifyWebApi = require('spotify-web-api-node');
const sp = require("./spotify");

const minicrypt = require('./miniCrypt').MiniCrypt;



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
const LocalStrategy = require('passport-local').Strategy; 


// *** APP SETUP ***
app.use(session({
  secret: process.env.SECRET || 'SECRET',
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({'extended' : true})); // allow URLencoded data
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
  }

  const findUser = async (username) => {
    const users = db.collection("users");
    return await users.findOne({username: username});
  }

  // *** PASSPORT and LOGIN and USER CREATION ***
  const strategy = new LocalStrategy(
    async (username, password, done) => {
      const found = await findUser(username);

      if (!found || !mc.check(password, found.salt, found.hash)) {
        await new Promise((r) => setTimeout(r, 1000)); 
        return done(null, false, { message: "Wrong username or password" });
      } 

      done(null, username);
    }
  );


  // no idea if you're suppposed to do this here
  passport.use(strategy);

  app.post("/login", passport.authenticate('local', {
    successRedirect: "/dashboard",
    failureRedirect: "/",
  }));

  app.post("/register", async (req, res) => {
    console.log(req.body)
    const { username, password } = req.body;
    if (findUser(username)) {
      res.json({success: false, message: "User already exists"})
    }
    if (await addUser(username, password)) {
      res.redirect("/");
    } 
  });

  const checkAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) { return next() }
    res.redirect("/")
  }

  const checkLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) return res.redirect("/dashboard");
    next();
  }

  app.delete("/logout", (req,res) => {
    req.logout();
    res.redirect("/");
 })


  // *** SPOTIFY ***
  app.get("/accessToken", (req, res) => {
    res.json(sp.accessToken);
  });

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
    db.collection("users").insertOne({ user })
      .then((_) => res.json("saved comment"))
      .catch(console.err);
  });


  let port = process.env.PORT;
  if (port == null || port == "") {
    port = 8000;
  }

  app.listen(port, async () => {
    console.log(`Spotify Wheel listening on port ${port}`);
  });

});



module.exports = app;
