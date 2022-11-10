document.getElementById('comment-button').addEventListener('click', () => {
    window.location.href = '/comments'
})


const playlistsDiv = document.getElementById('user-playlists')

let currentUrl = window.location.href

let arr = currentUrl.split('/')
arr = arr.slice(0, -1)

console.log(arr)

currentUrl = arr.join('/')

console.log(currentUrl)

loadPlaylists()

document.getElementById('add-button').addEventListener('click', async () => {
    const response = await fetch(`${currentUrl}/api/add_song`);
    const data = await response.json();
    console.log(data);
})

document.getElementById('move-button').addEventListener('click', async () => {
    const response = await fetch(`${currentUrl}/api/move_song`);
    const data = await response.json();
    console.log(data);
})

document.getElementById('delete-button').addEventListener('click', async () => {
    const response = await fetch(`${currentUrl}/api/remove_song`);
    const data = await response.json();
    console.log(data);
})


async function loadPlaylists() {
    const response = await fetch(currentUrl + '/api/playlists')
    const playlists = await response.json();

    playlistsDiv.innerHTML = ""
    for (let i = 0; i < playlists.length; i++){
        const element = document.createElement('li')
        element.classList.add('list-group-item')
        element.id = playlists[i]
        element.innerHTML = playlists[i]
        element.addEventListener('click', async () => {
            const response = await fetch(`${currentUrl}/api/get_songs/${playlists[i]}`);
            const songs = await response.json();
            document.getElementById('current-playlist').innerHTML = playlists[i];
            renderSongs(songs);
        })
        playlistsDiv.appendChild(element)
    }
}


const firstPlaylistDiv = document.getElementById('2 Cool 4 Skool')

firstPlaylistDiv.addEventListener('click', loadSongs)

// async function loadSongs(){
//     console.log('FAT')
//     const response = await fetch(currentUrl + '/api/songs')
//     const songs = await response.json();

//     for (let i = 0; i < songs.length; i++){
//         const element = document.createElement('li')
//         element.classList.add('list-group-item')
//         element.innerHTML = songs[i]

//         firstPlaylistDiv.appendChild(element)
//     }

// }

function renderSongs(songs) {
    console.log(songs);
    const songList = document.getElementById('playlist-songs');
    songList.innerHTML = '';
    for (const song of songs) {
        const element = document.createElement('li');
        element.classList.add('list-group-item');
        element.innerHTML = song;
        songList.appendChild(element);
    }
}