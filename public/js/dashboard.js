// HOW TO IMPORT THE SPOTIFY STUFF INTO HERE? GOAL IS TO BE ABLE TO WORK WITH THE FUNCTIONS DEFINED IN SPOTIFYTEST.JS (SHOULD PROB MOVE THEM TO LIKE SPOTIFY.JS)
// ALONG WITH THE ACCESS TOKEN GENERATED IN APP.JS, ALONG WITH SPOTIFYWEBAPI MODULE
// AFTER THIS IS DONE, CAN USE THIS DATA TO POPULATE THE UI
// I tried shit like
// import SpotifyWebApi from "../node_modules/spotify-web-api-node"; or var SpotifyWebApi = require('../../spotify-web-api-node');

// const accessToken =
//   "BQB0q4fBd2hbRuB0RcEGo_qVKB2-4uB4q0Z5dGAuayuw9NpM3LCHohD6-spQm0Z-KGSjnxER75j8ZAJaBo6ef_se30DkFLmSaiOAld-O8ZpQN1G25Bm8Czvkqwer5WvwYyYzIrZazz1rdPytWkxofrVaI8GqdmAEmXHpMuawF579AQVgywyvNl1_DZan65SJQhEfknErYhDTAhgjDULCEClgDaBRDROaNEL0Ec_oMMNZ8BHMqqaoyrBdE5b34TK6p0qNdHQPxPyV50QZHwaMzCdRoM3oRpuiU_BDm5KNXraYJ2Y6gX8RIAzJEamK6KOjTyY";
// const spotifyApi = new SpotifyWebApi();


window.onload = async (event) => {
  fetch("/authenticated").then((data) => {
    return data.json();
  }).then((data) => {
    if (!data.authenticated) {
      window.location.href = "/";
    }
    else {
      loadPlaylists();
      (async () => {
        if ((await ((await fetch("/api/get_player_status")).json())).is_playing) {
          togglePausePlay();
        }
      })();
    }
  })
};

let focusedPlaylistID = "";
const selectedSong = {};

document.addEventListener(
  "mousedown",
  function (event) {
    if (event.detail > 1) {
      event.preventDefault();
    }
  },
  false
);

document.getElementById("logout-button").addEventListener("click", (event) => {
  event.preventDefault();
  window.location.href = "/logout";
});

document.getElementById("comment-button").addEventListener("click", async () => {
  event.preventDefault();
  const response = await fetch("/api/get_player_status");
  const data = await response.json();
  if (data.is_playing) {
    window.location.href = "/comments";
  }
  else {
    alert("not currently playing song");
  }
});

const playlistsDiv = document.getElementById("user-playlists");

function togglePausePlay() {
  document.getElementById("play-circle-button").classList.toggle("hidden");
  document.getElementById("pause-circle-button").classList.toggle("hidden");
}

document
  .getElementById("skip-back-button")
  .addEventListener("click", async () => {
    const response = await fetch("/api/skip_to_previous_track");
    const data = await response.json();
    if (
      document
        .getElementById("pause-circle-button")
        .classList.contains("hidden")
    ) {
      togglePausePlay();
    }
  });

document
  .getElementById("skip-forward-button")
  .addEventListener("click", async () => {
    const response = await fetch("/api/skip_to_next_track");
    const data = await response.json();
    if (
      document
        .getElementById("pause-circle-button")
        .classList.contains("hidden")
    ) {
      togglePausePlay();
    }
    console.log(data);
  });

document.getElementById("add-button").addEventListener("click", async () => {
  const res = await fetch("/api/get_currently_playing_track_info");
  const songObj = await res.json();

  console.log(focusedPlaylistID, "focused playllsit", songObj.uri, "song uri");

  await fetch("/api/add_song", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify([songObj.uri, focusedPlaylistID]),
  });

  const element = document.createElement("li");
  element.classList.add("list-group-item");
  element.innerHTML = songObj.name;
  element.id = songObj.id;
  element.addEventListener('click', async (e) => {
    for (const node of document.getElementById("playlist-songs").childNodes) {
      if (node.id === selectedSong.id) {
        node.classList.toggle("selected");
      }
    }
    selectedSong.id = songObj.id;
    selectedSong.uri = songObj.uri;
    e.currentTarget.classList.toggle("selected");  
    await fetch("/api/play_song", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify([songObj.album_uri, songObj.track_number]),
    });
    })
    const songList = document.getElementById('playlist-songs');
    songList.prepend(element);
});

document.getElementById("delete-button").addEventListener("click", async () => {
    await fetch("/api/remove_song", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify([selectedSong.uri, focusedPlaylistID]),
    });
    const currentSong = document.getElementById(selectedSong.id);
    currentSong.parentNode.removeChild(currentSong);
});

document
  .getElementById("play-circle-button")
  .addEventListener("click", async () => {
    togglePausePlay();
    const response = await fetch("/api/resume_player");
    const data = await response.json();
  });

document
  .getElementById("pause-circle-button")
  .addEventListener("click", async () => {
    togglePausePlay();
    const response = await fetch("/api/pause_player");
    const data = await response.json();
  });

async function loadPlaylists() {
  const response = await fetch("/api/playlists");
  const playlists = await response.json();
  console.log(playlists);
  playlistsDiv.innerHTML = "";
  for (let i = 0; i < playlists.length; i++) {
    const element = document.createElement("li");
    element.classList.add("list-group-item");
    element.id = playlists[i][1];
    element.innerHTML = playlists[i][0];
    element.addEventListener("click", async (e) => {
      //set focused playlist variable
      for (const node of document.getElementById("user-playlists").childNodes) {
        if (node.id === focusedPlaylistID) {
          node.classList.toggle("selected");
        }
      }
      focusedPlaylistID = playlists[i][1];
      e.currentTarget.classList.toggle("selected");
      const response = await fetch(`/api/get_songs/${playlists[i][1]}`);
      const songs = await response.json();
      document.getElementById("current-playlist").innerHTML = playlists[i][0];
      renderSongs(songs);
    });
    playlistsDiv.appendChild(element);
  }
}

function renderSongs(songs) {
  const songList = document.getElementById("playlist-songs");
  songList.innerHTML = "";
  for (const song of songs) {
    const element = document.createElement("li");
    element.classList.add("list-group-item");
    element.innerHTML = song[0];
    element.id = song[3];
    element.addEventListener('click', async (e) => {
      for (const node of document.getElementById("playlist-songs").childNodes) {
        if (node.id === selectedSong.id) {
          node.classList.toggle("selected");
        }
      }
      selectedSong.id = song[3];
      selectedSong.uri = song[4];
      e.currentTarget.classList.toggle("selected");
      console.log(document.getElementById("pause-circle-button").classList);
      if (
        document
          .getElementById("pause-circle-button")
          .classList.contains("hidden")
      ) {
        console.log("toggled pause play");
        togglePausePlay();
      }
      await fetch("/api/play_song", {
          method: "POST",
          headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
          },
          body: JSON.stringify([song[2], song[1]]),
      });
    })
    songList.appendChild(element);
  }
}