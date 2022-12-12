// THESE ARE ALL THE FUNCTIONS YOU'LL NEED, EXCLUDING ONE TO GET THE CURRENTLY PLAYING PLAYLIST BECAUSE IT'S REALLY AIDS
// TO BE ABLE TO RUN THEM, YOU NEED A SPOTIFYAPI OBJECT, AN ACCESS TOKEN, AND TO LINK THAT TOKEN TO THE API OBJECT
// REMEMBER THESE ARE ALL ASYNC SO THEY NEED TO BE RUN IN ANOTHER ASYNC FUNCTION WITH AWAIT OR ELSE U GET PROMISE HELL

// generate an access token by running npm start and going to localhost:8000/spotifyLogin, it will print in the terminal and u can copy paste, it expires after an hour
// what we really want though is for it to be auto added to some sort of environment variable that can be accessed in dashboard.js
// we also want to be able to link these functions and a spotify object in dashboard.js

// REF TO API WRAPPER GITHUB: https://github.com/thelinmichael/spotify-web-api-node#player

const SpotifyWebApi = require("spotify-web-api-node");
const spotifyApi = new SpotifyWebApi();

//EXAMPLE CHAINING TOGETHER CALLS
// spotifyApi
//   .getMe()
//   .then(function (data) {
//     return data.body.id;
//   })
//   .then(function (id) {
//     return getUserOwnedPlaylists(id);
//   })
//   .then(function (playlists) {
//     //console.log(playlists)
//     printPlaylists(playlists);
//   })
//   .catch(function (error) {
//     console.error(error);
//   });

// function printPlaylists(playlists) {
//   for (let s of playlists) {
//     console.log(s);
//   }
// }

// EXAMPLE HOW TO RUN THESE FUNCTIONS
// doAsyncStuff();
// // how to get data from an api call
// async function doAsyncStuff() {
//     const id = await spotifyApi.getMe().then(function (data) {
//       return data.body.id;
//     });
//   const playlists = await getUserOwnedPlaylists(id);
//   console.log(playlists, "kekekeKSDJFKLSD");
//   await addSongToPlaylist('spotify:track:2Xr1dTzJee307rmrkt8c0g', 'love nwantnti', playlists[0].id, playlists[0].name)
//   await deleteSongFromPlaylist('spotify:track:2Xr1dTzJee307rmrkt8c0g', 'love nwantnti', playlists[0].id, playlists[0].name, playlists[0].snapshotID)
//   moveSongBetweenPlaylists('spotify:track:2Xr1dTzJee307rmrkt8c0g', 'love nwantnti', playlists[0].id, playlists[0].name, playlists[1].id, playlists[1].name)

//   const currSongObj = await getCurrentPlayingSongInfo();
//   console.log(currSongObj);
//   await pausePlayer();
//   await skipToNextTrack();
// }

//BEGIN ALL NEEDED FUNCTIONS

//resumes player, assuming there has been a recent use of spotify and it can identify a device
async function resumePlayer() {
  spotifyApi.play().then(
    function () {
      console.log("Playback started");
    },
    function (err) {
      //if the user making the request is non-premium, a 403 FORBIDDEN response code will be returned
      console.log("Something went wrong!", err);
    }
  );
}

//pauses player, assuming there has been a recent use of spotify and it can identify a device
async function pausePlayer() {
  spotifyApi.pause().then(
    function () {
      console.log("Playback paused");
    },
    function (err) {
      //if the user making the request is non-premium, a 403 FORBIDDEN response code will be returned
      console.log("Something went wrong!", err);
    }
  );
}

//skips to next track, assuming there has been a recent use of spotify and it can identify a device
async function skipToNextTrack() {
  spotifyApi.skipToNext().then(
    function () {
      console.log("Skip to next");
    },
    function (err) {
      //if the user making the request is non-premium, a 403 FORBIDDEN response code will be returned
      console.log("Something went wrong!", err);
    }
  );
}

//skips to previous track, assuming there has been a recent use of spotify and it can identify a device
async function skipToPreviousTrack() {
  spotifyApi.skipToPrevious().then(
    function () {
      console.log("Skip to previous");
    },
    function (err) {
      //if the user making the request is non-premium, a 403 FORBIDDEN response code will be returned
      console.log("Something went wrong!", err);
    }
  );
}

// returns an object with properties of currently playing song name, artist, and a link to the album cover image for the currently playing song
async function getCurrentPlayingSongInfo() {
  return await spotifyApi.getMyCurrentPlayingTrack().then(
    function (data) {
      if (data.body.item === undefined) {
        console.log("nothing is playing");
        return null;
      } else {
        //console.log(data.body)
        return {
          name: data.body.item.name,
          artist: data.body.item.artists[0].name,
          imageURL: data.body.item.album.images[0].url,
          id: data.body.item.id
        };
      }
    },
    function (err) {
      console.log("Something went wrong!", err);
    }
  );
}

// get the id of the current user
async function getUserID() {
  return await spotifyApi.getMe().then(function (data) {
    return data.body.id;
  });
}

// input a userid, and return an array containing playlist objects with the structure of playlist name and id
async function getUserOwnedPlaylists(userID) {
  const data = await spotifyApi.getUserPlaylists(userID);
  let playlists = [];

  //console.log(data.body.items[0])

  for (let playlist of data.body.items) {
    if (playlist.owner.id === userID) {
      playlists.push({
        name: playlist.name,
        id: playlist.id,
      });
    }
  }
  return playlists;
}

// input a playlist ID, and return an array of song objects with the structure of name, artist, and uri (kind of like ID)
async function getPlaylistTracks(playlistID) {
  const data = await spotifyApi.getPlaylistTracks(playlistID, {
    offset: 1,
    limit: 100,
    fields: "items",
  });

  //console.log(data.body.items[0].track.artists)

  let tracks = [];

  for (let track_obj of data.body.items) {
    tracks.push({
      name: track_obj.track.name,
      artist: track_obj.track.artists[0].name,
      uri: track_obj.track.uri,
    });
  }

  return tracks;
}

// input a songURI, song name, playlist ID, and playlist name to add that song to that playlist
async function addSongToPlaylist(songURI, songName, playlistID, playlistName) {
  spotifyApi.addTracksToPlaylist(playlistID, [songURI]).then(
    function (data) {
      console.log(`Added ${songName} to ${playlistName}`);
    },
    function (err) {
      console.log("Something went wrong!", err);
    }
  );
}

// input a songURI, song name, playlist ID, and playlist name to delete all instances of that song from that playlist
async function deleteSongFromPlaylist(
  songURI,
  songName,
  playlistID,
  playlistName
) {
  var tracks = [{ uri: songURI }];
  spotifyApi.removeTracksFromPlaylist(playlistID, tracks).then(
    function (data) {
      console.log(`Removed ${songName} from ${playlistName}`);
    },
    function (err) {
      console.log("Something went wrong!", err);
    }
  );
}

// input a song URI, song name, source playlist id, source playlist name, destination playlist ID, and
// destination playlist name to move that song from the source to destination playlist (remove from source and add to destination)
async function moveSongBetweenPlaylists(
  songURI,
  songName,
  fromPlaylistID,
  fromPlaylistName,
  toPlaylistID,
  toPlaylistName
) {
  addSongToPlaylist(songURI, songName, toPlaylistID, toPlaylistName);
  deleteSongFromPlaylist(songURI, songName, fromPlaylistID, fromPlaylistName);
  console.log(
    `Moved ${songName} from ${fromPlaylistName} to ${toPlaylistName}`
  );
}
