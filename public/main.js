const playlistsDiv = document.getElementById('user-playlists')

let currentUrl = window.location.href

let arr = currentUrl.split('/')
arr = arr.slice(0, -1)

console.log(arr)

currentUrl = arr.join('/')

console.log(currentUrl)

loadPlaylists()

async function loadPlaylists() {
    const response = await fetch(currentUrl + '/api/playlists')
    const playlists = await response.json();

    playlistsDiv.innerHTML = ""
    for (let i = 0; i < playlists.length; i++){
        const element = document.createElement('li')
        element.classList.add('list-group-item')
        element.id = playlists[i]
        element.innerHTML = playlists[i]

        playlistsDiv.appendChild(element)
    }
}


const firstPlaylistDiv = document.getElementById('2 Cool 4 Skool')

firstPlaylistDiv.addEventListener('click', loadSongs)

async function loadSongs(){
    console.log('FAT')
    const response = await fetch(currentUrl + '/api/songs')
    const songs = await response.json();

    for (let i = 0; i < songs.length; i++){
        const element = document.createElement('li')
        element.classList.add('list-group-item')
        element.innerHTML = songs[i]

        firstPlaylistDiv.appendChild(element)
    }

}