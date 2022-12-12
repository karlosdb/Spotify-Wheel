var SpotifyWebApi = require('spotify-web-api-node');

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
    clientId: '5bb105cf8e7a4b4dbd81c6db928df2c9',
    clientSecret: '58a0ec2e824447f6bc21c77cc5956003',
    redirectUri: 'https://spotify-wheel.herokuapp.com/callback'
  });

  module.exports = {spotifyApi, scopes}