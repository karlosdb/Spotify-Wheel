window.onload = async (event) => {
  fetch("/authenticated").then((data) => {
    return data.json();
  }).then((data) => {
    if (!data.authenticated) {
      window.location.href = "/";
    }
    else {
      loadComments();
    }
  })
};

async function loadComments() {
  const response = await fetch("/api/get_currently_playing_track_info");
  const data = await response.json();
  document.getElementById("album-img").src = data.imageURL;
  document.getElementById("song-name").innerHTML = data.name;
  document.getElementById("album-name").innerHTML = data.album;
  document.getElementById("artist-name").innerHTML = data.artist;
}

let currentUrl = window.location.href

let arr = currentUrl.split('/')
arr = arr.slice(0, -1)

console.log(arr)

currentUrl = arr.join('/')


document.getElementById('submit-button').addEventListener('click', async () => {
  const response = await fetch(`${currentUrl}/api/save_comment`);
  const data = await response.json();
  console.log(data);
})