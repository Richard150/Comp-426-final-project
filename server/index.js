const PORT = process.env.PORT || 5000;

const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

const Room = require('./Room');
const Account = require('./Account');

let usernames = [];      // array of usernames currently logged in. indexed by socket id
let registry = [];       // array of rooms where users are. indexed by socket id

let rooms = [];          // array of rooms. indexed by room name

let forbiddenNames = ['attack', 'block', 'heal', 'counter', 'repair', 'die', '']; // these break things
// funnily enough, if you tried to attack somebody named 'die', you would die. so that is extremely something that you do NOT want ppl to name themselves

//let usernames = [];      // array of usernames currently logged in. indexed by socket id
//let registry = [];       // array of rooms where users are. indexed by socket id

//let rooms = [];          // array of rooms. indexed by room name



app.get('/', (req, res) => {
    res.sendFile('index.html', {root: path.join(__dirname, '../client')});
});

app.get('/client.js', (req, res) => {
    res.sendFile('client.js', {root: path.join(__dirname, '../client')});
});

app.get('/style.css', (req, res) => {
    res.sendFile('style.css', {root: path.join(__dirname, '../client')});
});

app.use('/avatars', express.static(path.join(__dirname, '../avatars')));

io.on('connection', (socket) => {

    // OLD INITIAL STUFF

    socket.loggedIn = false;  
    // socket.join('lobby');
    // registry[socket.id] = 'lobby'; 
    // io.emit('online count', usersOnline);
    // io.emit('new name list', Object.values(usernames));
    // socket.emit('roomlist update', Object.keys(rooms));

    //

    // when the user disconnects, we do the following:
    socket.on('disconnect', () => {

        if (socket.loggedIn) {
            delete usernames[socket.id];
            leaveRoom(socket);
            delete registry[socket.id];

            io.to('lobby').emit('lobby update', {usernames: Object.values(usernames), rooms: Object.keys(rooms)});
        }

    });

    // when the user creates a room, we do the following:
    socket.on('create room', (roomName) => {
        if(socket.loggedIn) {
            roomName = roomName.replace(/\W /g,'').substring(0,20);
            if (rooms[roomName] == undefined && roomName != 'lobby' && socket.loggedIn) {
                rooms[roomName] = new Room(io, socket, roomName);
            }

            io.to('lobby').emit('lobby update', {usernames: Object.values(usernames), rooms: Object.keys(rooms)});
        }
    });

    // when the user joins a room, we do the following:
    socket.on('join room', (roomName) => {
        if (rooms[roomName] != undefined && socket.loggedIn) {
            rooms[roomName].userJoin(socket);
            registry[socket.id] = roomName;
        }
    });

    // when the user leaves a room they joined, we do the following:
    socket.on('leave room', () => {
       leaveRoom(socket);
    });

    socket.on('start game', () => {
        let roomName = registry[socket.id];
        // if the room exists, the person emitting this event is the room leader, and the room doesn't have a game going...
        if(rooms[roomName] != undefined && socket.userName == rooms[roomName].leader && !rooms[roomName].gameData.live) {
            rooms[roomName].createGame();
        }
    });

    // when the user sends a message, we do the following:
    socket.on('send message', (message) => {
        let roomName = registry[socket.id];
        if (rooms[roomName] != undefined) {
            rooms[roomName].message(socket, message);
        }
    });

    socket.on('send action', (action) => {
        let roomName = registry[socket.id];
        if (rooms[roomName] != undefined) {
            rooms[roomName].submitAction(socket, action);
        }
    });

    socket.on('login', (credentials) => {
        if(!socket.loggedIn) {
            let username = credentials.username;
            let password = credentials.password;

            if (Account.userExists(username) && Account.getPassword(username) == password.substring(0,3) && !Object.values(usernames).includes(username)) {
                socket.emit('login successful');
                socket.loggedIn = true;
                socket.userName = username;
                usernames[socket.id] = username;
                socket.emit('everybody', Account.getAllUsersAndAvatars());
                joinLobby(socket);

            } else {
                socket.emit('login unsuccessful');
            }
        }
    });

    socket.on('signup', (credentials) => {
        if (!socket.loggedIn) {
            let username = credentials.username;
            let password = credentials.password;

            let cleanName = username.replace(/\W/g,'').substring(0,20);

            if(cleanName != username || forbiddenNames.includes(username) || Account.userExists(username)) {
                socket.emit('signup unsuccessful');
            } else {
                socket.emit('signup successful');
                socket.loggedIn = true;
                socket.userName = username;
                usernames[socket.id] = username;
                Account.create(username, password.substring(0,3), 0);
                socket.emit('everybody', Account.getAllUsersAndAvatars());
                socket.broadcast.emit('account created', {username: username, avatar: Account.getAvatar(username)});
                joinLobby(socket);
            }
        }
    });

    socket.on('request profile info', (username) => {
        if (socket.loggedIn && Account.userExists(username)) {
            let profile = {
                username: username,
                wins: Account.getWins(username),
                gamesPlayed: Account.getGamesPlayed(username),
                avatar: Account.getAvatar(username),
                successfulAttacks: Account.getSucAttacks(username),
                failedAttacks: Account.getFailedAttacks(username),
                successfulBlocks: Account.getSucBlocks(username),
                failedBlocks: Account.getFailedBlocks(username),
                successfulCounters: Account.getSucCounters(username),
                failedCounters: Account.getFailedCounters(username),
                successfulHeals: Account.getSucHeals(username),
                failedHeals: Account.getFailedHeals(username),
                totalRepairs: Account.getTotalRepairs(username)
            }
            socket.emit('profile info', profile);
        } else {
            socket.emit('profile request denied');
        }
    });

    socket.on('change avatar', (avatarID) => {
        if (socket.loggedIn) {
            Account.setAvatar(socket.userName, avatarID);
            io.emit('avatar changed', {username: socket.userName, avatar: avatarID});
            io.to('lobby').emit('lobby update', {usernames: Object.values(usernames), rooms: Object.keys(rooms)});
        }
    });

    socket.on('delete profile', () => {
        if (socket.loggedIn) {
            Account.delete(socket.userName);

            delete usernames[socket.id];
            delete registry[socket.id];

            io.emit('account deleted', socket.userName);
            io.to('lobby').emit('lobby update', {usernames: Object.values(usernames), rooms: Object.keys(rooms)});
        }
    });
});


let joinLobby = (socket) => {
    socket.join('lobby');
    registry[socket.id] = 'lobby';
    io.to('lobby').emit('lobby update', {usernames: Object.values(usernames), rooms: Object.keys(rooms)});
}

// HOW TO SET A USER'S USERNAME //////////////////////////////
let chooseName = (socket, name) => {                        
    name = name.replace(/\W/g,'').substring(0,20);          // remove nonalphanumeric characters from the name

    if(!Object.values(usernames).includes(name) && !socket.loggedIn && !forbiddenNames.includes(name)) {          // check to see if the username is currently in use
        usernames[socket.id] = name;                        // put the new name in the username list
        socket.userName = name;                             // give the socket a 'userName' property
        io.emit('new name list', Object.values(usernames)); // let everybody know the updated name list
    }

}

let leaveRoom = (socket) => {
    let roomName = registry[socket.id];
    let room = rooms[roomName];
    if (roomName != 'lobby' && roomName != undefined && room != undefined) {
        room.userLeave(socket);
        socket.emit('lobby update', {usernames: Object.values(usernames), rooms: Object.keys(rooms)});
        if (room.userList.length == 0) {
            delete rooms[roomName];
            io.to('lobby').emit('lobby update', {usernames: Object.values(usernames), rooms: Object.keys(rooms)});
        }
    }
}

http.listen(PORT, () => {
    console.log('listening on *:' + PORT);
});