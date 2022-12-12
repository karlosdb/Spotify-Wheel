Team Name: Upsilon
App name: Spotify wheel
Semester: Fall 2022

Overview: 
Spotify wheel is a webapp that allows users to interface with their spotify account in a new innovative ways. It allows you to manipulate playlists
in a more convenient fashion from the current playing song. It also lets you to be able to comment other people's songs and view any reviews left by other users. 
Our app is innovative because it provides more additions on top of the regular spotify features, giving users more options to interact not only with
the app but also other people. 

Team Members: Shubhranshu Mishra (ShubyM), Karlos Boehlke (karlosdb), Kevin Nguyen (ktnguy)

User Interface: 
When first accessing the site, the user is firs greeted by our login page. The user has the option to either login with a username/password, or register
with a unique username. If logging in for the first time, users will be brought to an OAuth page for connectingto spotify. Once connected, users will
have their dashboard displayed. The dashboard contains all playlists your account has on the left column and two options on right, add song to 
playlist and remove song from playlist. If you click on a playlist, it will bring up the songs in your playlist. Clicking on a song will play it. 
In the bottom left, we also have comments and logout. The comments contains the comments of the currently playing song. 
Logging out brings you to the logout page. 


So in summary, we have: 
Login page
Register
OAuth
Dashboard
Comments

APIs: 
We use the "Spotify WebAPI Node" (https://github.com/thelinmichael/spotify-web-api-node) to connect to the user's spotify account. 

DATABASE:
For our website, we used MongoDB for our database. In our database, we have two collections, users and comments. Users contains account info and 
comments just contain songs and their comments. More specifically, the users collection stores documents containing a username, hashed password, and
a unique salt. The songs collection contains documents containing a song name and a associated list of comments. 

APIs/Routing
For authentication:
Our local strategy is that whenever a user inputs their account info, we perform a check to see if the username first exists. If it does,
we check to see if the hashed version + salt of the input password matches the database. If they do match, we know that the user is authenticated.

POST /login: 
We are using a local strategy. If it passes the local strategy (Successful login), the user will be redirected to the spotify login page. This endpoint
just helps us check that.

POST /checkUsername: 
Checks to see if the username is in the database. If it is, it returns a JSOON with true, otherwise false. 

POST /register:
Register takes the input username and password and calls the addUser function. If it is able to be added, it will redirect the user to the login page

POST logout:
Logs the user out and returns them to the login page

GET /SpotifyLogin:
Redirects user to the spotify oAuth page

GET /Callback:
Callback grants us a token when a user authorizes their spotify to connect. When a user coonects to spotify, the callback endpoint is called.

GET /:
If user is not logged in, they will be sent to the login page when they go to the default page. 

GET /dashboard: 
Sends the user to the dashboard if they are logged in

GET /comments:
Redirects to the comment page if user is logged in

GET /api/playlists:
Returns a list of all the playlists that the user owns

GET /api/get_sonsgs/:playlist/:
Returns a list of songs from the given playlist

POST /api/save_comment:
Saves a comment in the database to the corresponding song

POST /api.get_comments:
Returns an array of comments for a song. 

Authentication:
We authenticate users by storing their username, hashed password, and salt in our database. Whenever a user creates an account, we compute a hash
of their password using a salt and store the information. When logging in, we will make a POST request to our endpoint with the username and password. 
We will find the document with the user's username, and use our hashing function with the stored salt to see if the passwords match. If they are, they 
are successfully authenticated, otherwise they will be denied and have to try again to login. This authentication allows them to connect their spotify
and access their dashboard along with all the playlists and controls. 

Division of labor: 
Shuby: Authentication and setting up the database
Kevin: Responsible for frontend/backend interactions and user experience
Karlos: API connections and connecting it with spotify controls and content. 

Conclusion: 



