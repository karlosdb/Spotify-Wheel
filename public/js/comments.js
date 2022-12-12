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


let song_uri = "";

async function loadComments() {
  const response = await fetch("/api/get_currently_playing_track_info");
  const data = await response.json();
  document.getElementById("album-img").src = data.imageURL;
  document.getElementById("song-name").innerHTML = `Name: ${data.name}`;
  document.getElementById("album-name").innerHTML = `Album: ${data.album}`;
  document.getElementById("artist-name").innerHTML = `Artist: ${data.artist}`;


  song_uri = data.uri;

  const comments = await fetch("/api/get_comments", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify([data.uri]),
  });

  const commentsData = await comments.json();
  renderComments(commentsData);
  // TODO: LOOP THROUGH COMMENTS AND ADD THEM TO THE PAGE
}



// input a list of strings/comments
function renderComments(comments){
  const commentList = document.getElementById('comment-group')
  commentList.innerHTML = '';
  for (const comment of comments){
    const element = document.createElement("li");
    element.classList.add("list-group-item");
    element.classList.add("comment-item");
    element.innerHTML = 
    `<a class = "follow"> + </a>
    <a> ${comment.user} - ${comment.comment} </a>
    <a class = "follow"> ❤ </a>`

    commentList.appendChild(element)
  }
}

let currentUrl = window.location.href

let arr = currentUrl.split('/')
arr = arr.slice(0, -1)

console.log(arr)

currentUrl = arr.join('/')


document.getElementById('submit-button').addEventListener('click', async () => {
  // const response = await fetch(`${currentUrl}/api/save_comment`);
  await fetch("/api/save_comment", {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify([document.getElementById("comment-area").value, song_uri]),
  });
  document.getElementById("comment-area").value = '';
  loadComments();
});

document.getElementById('back-button').addEventListener('click', (event) => {
  event.preventDefault();
  window.location.href = '/dashboard';
})