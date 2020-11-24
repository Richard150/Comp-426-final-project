const Game = require("./Game");
const Account = require('./Account');

class Room {
    constructor(io, creatorSocket, roomName) {
        this.io = io;
        this.userList = [];
        this.roomName = roomName;
        this.chatlog = [];
        this.gameData = {
            live: false,
            lockedIn: [],
            data: {
                players: {},
                summary: []
            },
            winner: ''
        };

        this.leader = creatorSocket.userName;
        this.event = 'created room';

        this.dataToClient = {
            usernames: this.userList,
            chatlog: this.chatlog,
            leader: this.leader,
            game: this.gameData,
            event: this.event
        }
    }

    createGame() {
        this.game = new Game(this.userList);
        this.gameData.live = true;

        this.newTurn(this.game.resolveTurn());
    }

    newTurn(data) {
        clearTimeout(this.turnTimer);

        let usernames = Object.keys(data.players);

        this.gameData.lockedIn = [];
        this.gameData.data = data;

        let livingPlayers = Object.values(data.players).filter(p => p.health > 0);

        this.gameData.live = livingPlayers.length > 1;

        if(!this.gameData.live) {
            if(livingPlayers.length == 0) {
                this.gameData.winner = '$nobody';
                usernames.forEach(name => Account.addGamesPlayed(name));
                // addGamesPlayed everyone
            } else {
                this.gameData.winner = usernames.find(p => data.players[p].health > 0);
                if (usernames.length > 1) Account.addWin(this.gameData.winner);
                // addGamesPlayed everyone
                usernames.forEach(name => Account.addGamesPlayed(name));
                
            }
        } else {
            this.turnTimer = setTimeout(() => {this.newTurn(this.game.resolveTurn())}, 15000);
        }

        this.dataToClient.event = 'new turn';
        this.io.to(this.roomName).emit('room update', this.dataToClient);
    }

    actionSubmitted(player) { // this covers when a user submits an action that /does not/ advance the game to the next turn
        this.gameData.lockedIn.push(player);

        this.dataToClient.event = 'action submitted';
        this.io.to(this.roomName).emit('room update', this.dataToClient);
    }

    submitAction(socket, action) {
        let target = undefined;
        if (this.userList.includes(socket.userName) && this.game != undefined) { 
            if (action != 'block' && action != 'counter' && action != 'repair' && action != 'heal' && action != 'die') {
                target = action;
                action = 'attack';
            }
            let response = this.game.submitAction(socket.userName, action, target);
            if (response === 'accepted') {
                this.actionSubmitted(socket.userName);
            } else if (response === 'rejected') {
                // do nothin
            } else {
                this.newTurn(response);
            }
        }
    }

    userJoin(socket) {
        if (!this.userList.includes(socket.userName)) {
            this.userList.push(socket.userName);
            socket.join(this.roomName);
            socket.leave('lobby');

            this.dataToClient.event = 'user joined';
            this.io.to(this.roomName).emit('room update', this.dataToClient);
        }
    }

    userLeave(socket) {
        let index = this.userList.indexOf(socket.userName);
        if (index > -1) {
            if(this.gameData.live) {
                this.submitAction(socket, 'die');
            }

            this.userList.splice(index, 1);
            socket.leave(this.roomName);
            socket.join('lobby');

            

            if (socket.userName == this.leader) {
                this.leader = this.userList[0];
                this.dataToClient.leader = this.leader;
            }

            this.dataToClient.event = 'user left';
            this.io.to(this.roomName).emit('room update', this.dataToClient);
        }
    }

    message(socket, message) {
        if (this.userList.includes(socket.userName)) {
            message = message.replace(/[^a-zA-Z0-9 .,!@?#$%^&*()+=_'";:/~-]/g, '');
            this.chatlog.push(`${socket.userName}: ${message}`);
            if (this.chatlog.length > 25) {
                this.chatlog.shift();
            }

            this.dataToClient.event = 'new message';
            this.io.to(this.roomName).emit('room update', this.dataToClient);
        }
    }
}
 
module.exports = Room;