// HOW TO IMPORT THE SPOTIFY STUFF INTO HERE? GOAL IS TO BE ABLE TO WORK WITH THE FUNCTIONS DEFINED IN SPOTIFYTEST.JS (SHOULD PROB MOVE THEM TO LIKE SPOTIFY.JS)
// ALONG WITH THE ACCESS TOKEN GENERATED IN APP.JS, ALONG WITH SPOTIFYWEBAPI MODULE
// AFTER THIS IS DONE, CAN USE THIS DATA TO POPULATE THE UI
// I tried shit like
// import SpotifyWebApi from "../node_modules/spotify-web-api-node"; or var SpotifyWebApi = require('../../spotify-web-api-node');

// const accessToken =
//   "BQB0q4fBd2hbRuB0RcEGo_qVKB2-4uB4q0Z5dGAuayuw9NpM3LCHohD6-spQm0Z-KGSjnxER75j8ZAJaBo6ef_se30DkFLmSaiOAld-O8ZpQN1G25Bm8Czvkqwer5WvwYyYzIrZazz1rdPytWkxofrVaI8GqdmAEmXHpMuawF579AQVgywyvNl1_DZan65SJQhEfknErYhDTAhgjDULCEClgDaBRDROaNEL0Ec_oMMNZ8BHMqqaoyrBdE5b34TK6p0qNdHQPxPyV50QZHwaMzCdRoM3oRpuiU_BDm5KNXraYJ2Y6gX8RIAzJEamK6KOjTyY";
// const spotifyApi = new SpotifyWebApi();

let focusedPlaylistID = "";

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

document.getElementById("comment-button").addEventListener("click", () => {
  window.location.href = "/comments";
});

const playlistsDiv = document.getElementById("user-playlists");

function togglePausePlay() {
  document.getElementById("play-circle-button").classList.toggle("hidden");
  document.getElementById("pause-circle-button").classList.toggle("hidden");
}

loadPlaylists();

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
});

document.getElementById("move-button").addEventListener("click", async () => {
  const response = await fetch("/api/move_song");
  const data = await response.json();
  console.log(data);
});

document.getElementById("delete-button").addEventListener("click", async () => {
    const res = await fetch("/api/get_currently_playing_track_info");
    const songObj = await res.json();
  
    console.log(focusedPlaylistID, "focused playllsit", songObj.uri, "song uri");
  
    await fetch("/api/remove_song", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify([songObj.uri, focusedPlaylistID]),
    });
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
    element.addEventListener("click", async () => {
      //set focused plsylist variable
      focusedPlaylistID = playlists[i][1];
      console.log("focused playlist id: ", focusedPlaylistID);

      const response = await fetch(`/api/get_songs/${playlists[i][1]}`);
      const songs = await response.json();
      document.getElementById("current-playlist").innerHTML = playlists[i][0];
      renderSongs(songs);
    });
    playlistsDiv.appendChild(element);
  }
}

function renderSongs(songs) {
  //console.log(songs);
  const songList = document.getElementById("playlist-songs");
  songList.innerHTML = "";
  for (const song of songs) {
    const element = document.createElement("li");
    element.classList.add("list-group-item");
    element.innerHTML = song;
    songList.appendChild(element);
  }
}
