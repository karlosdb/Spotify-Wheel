

# API Documentation

base = /api/

# Endpoints

# Post-Requests
- Save Comment
    /api/save_comment
    parameters:
        user_id: users-id who is saving there comment
        comment: text containing the comment they are leaving

- Add current song playing to selected playlist
    /api/add_song
        parameters:
            token: spotify oauth token
            current_song: song currently playing
            playlist: which playlist we are adding to
        response:
            status_code 200 is response is ok

- Remove current song playing to selected playlist
    /api/remove_song
        parameters:
            token: spotify oauth token
            current_song: song currently playing
            playlist: which playlist we are removing from
        response:
            status_code 200 is response is ok

-  Move to Endpoint
    /api/move_song
        parameters:
            token: spotify oauth token
            source: source_playlist (playlist being removed from)
            dest: destination playlist (playlist being added to)
            song: which song is being moved and added
        response:
            status_code 200 is response is ok


# Get-Requests

- Get Current song
    /api/current_song/ 
    parameters:
        token: spotify oauth token
    response:
        {song: "Love Sosa"}
    
- Get Playlists
    /api/playlists/ 
    parameters:
        token: spotify oauth token
    response:
        {}







