const SpotifyWebApi = require("spotify-web-api-node");

const accessToken = 'BQCNmqCFe_fswKKj0xbz2hxUgeAmHjVPj3npIn3atUeqtuvZwTy7GGb5-wKwWF2ltasg6j9foyaM7XrVelfT-VP3669NsLOD2x9ZPY_2P7xyX8z6VEnoZiE4WKnrZAU-CJTuOpMV0BkgADRI9Z9VcVJXar3HK6Z4YOpRP8FecICGryUeLUki4GvgMQpDsvGXpfyFMkFit4Exrr6S3iIFiXe3fZRCDiO-NCkRQaEBK8XN6cmpbMIPfJLVUrd-RCjwU-aVCXvCqBSiK80Vy6q0I_XiewTFfM0xAlNQ2iEpBJrgygA9Hfhc66hpwvEYC5_vDoU'
const spotifyApi = new SpotifyWebApi();

spotifyApi.setAccessToken(accessToken);

// var id = ''
// spotifyApi.getMe().then(
//     function(data){
//         console.log(data.body.id)
//         id = data.body.id
//     }, function(err) {
//         console.error(err);
//     }
// );

// console.log(id)

//chaining together calls
spotifyApi
  .getMe()
  .then(function (data) {
    return data.body.id;
  })
  .then(function (id) {
    return getUserOwnedPlaylists(id);
  })
  .then(function (playlists) {
    //console.log(playlists)
    printPlaylists(playlists);
  })
  .catch(function (error) {
    console.error(error);
  });

function printPlaylists(playlists) {
  for (let s of playlists) {
    //console.log(s);
  }
}


doAsyncStuff();
// how to get data from an api call
async function doAsyncStuff() {
//   const id = await spotifyApi.getMe().then(function (data) {
//     return data.body.id;
//   });
  //const playlists = await getUserOwnedPlaylists(id);
  //console.log(playlists, "kekekeKSDJFKLSD");
  //await addSongToPlaylist('spotify:track:2Xr1dTzJee307rmrkt8c0g', 'love nwantnti', playlists[0].id, playlists[0].name)
  //await deleteSongFromPlaylist('spotify:track:2Xr1dTzJee307rmrkt8c0g', 'love nwantnti', playlists[0].id, playlists[0].name, playlists[0].snapshotID)
  //moveSongBetweenPlaylists('spotify:track:2Xr1dTzJee307rmrkt8c0g', 'love nwantnti', playlists[0].id, playlists[0].name, playlists[1].id, playlists[1].name)

  const currSongObj = await getCurrentPlayingSongInfo()
  console.log(currSongObj)
}

//getMyData();
// spotifyApi.getMyCurrentPlayingTrack().then(
//   function (data) {
//     if (data.body.item === undefined) {
//       console.log("nothing is playing");
//     } else {
//       console.log(data.body.item.album.images[0].url);
//     }
//   },
//   function (err) {
//     console.log("Something went wrong!", err);
//   }
// );

// const tracky = currentTrack.resolve();

// function getMyData() {
//   (async () => {
//     const me = await spotifyApi.getMe();
//     console.log(me.body.id);
//     // console.log(me.body);
//     const playlists = await getUserOwnedPlaylists(me.body.id);
//     //console.log(playlists)
//     const tracks = await getPlaylistTracks(playlists[0].id);
//     console.log(await getCurrentPlayingSongInfo())
//     //console.log(tracks)
//   })().catch((e) => {
//     console.error(e);
//   });
// }

async function getCurrentPlayingSongInfo() {
    return await spotifyApi.getMyCurrentPlayingTrack().then(
        function (data) {
          if (data.body.item === undefined) {
            console.log("nothing is playing");
            return null
          } else {
            //console.log(data.body.item.album.images[0].url);
            return(
                {
                    name: data.body.item.name,
                    artist: data.body.item.artists[0].name,
                    imageURL: data.body.item.album.images[0].url
                }
            )
          }
        },
        function (err) {
          console.log("Something went wrong!", err);
        }
      );
}

async function getUserID() {
  return await spotifyApi.getMe().then(function (data) {
    return data.body.id;
  });
}

async function getUserOwnedPlaylists(userName) {
  const data = await spotifyApi.getUserPlaylists(userName);
  let playlists = [];

  //console.log(data.body.items[0])

  for (let playlist of data.body.items) {
    if (playlist.owner.id === userName) {
      playlists.push({ name: playlist.name, id: playlist.id , snapshotID: playlist.snapshot_id});
    }
  }
  return playlists;
}

async function getPlaylistTracks(playlistId) {
  const data = await spotifyApi.getPlaylistTracks(playlistId, {
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

async function deleteSongFromPlaylist(songURI, songName, playlistID, playlistName) {
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

async function moveSongBetweenPlaylists(songURI, songName, fromPlaylistID, fromPlaylistName, toPlaylistID, toPlaylistName) {
    addSongToPlaylist(songURI, songName, toPlaylistID, toPlaylistName);
    deleteSongFromPlaylist(songURI, songName, fromPlaylistID, fromPlaylistName);
    console.log(`Moved ${songName} from ${fromPlaylistName} to ${toPlaylistName}`)
}
