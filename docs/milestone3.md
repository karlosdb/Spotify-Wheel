# MongoDB Database

## Structure of Database

### Users
- {username: string, liked_songs: List of document ID's for songs, comments: list of comment id's associated with this user}

### Songs
- {name: string, commments: List of document ID's for comment}

### Comments
- {writer: user_id, content: string}

## Division of Labor
Karlos: Created database and connection configuration code with environment variable
Kevin: Created basic database connection routes for the future implementation
Shubhranshu: Worked on figuring out schema for each of the 