const Game = require("./Game");

class Room {
    constructor(io, creatorSocket, roomName) {
        this.io = io;
        this.userList = [];
        this.roomName = roomName;
        this.chatlog = [];
        this.gameData = {
            live: false,
            lockedIn: [],
            data: {},
            winner: ''
        };

        this.leader = creatorSocket.userName;

        this.dataToClient = {
            usernames: this.userList,
            chatlog: this.chatlog,
            leader: this.leader,
            game: this.gameData
        }
    }

    createGame() {
        this.game = new Game(this.userList);
        this.gameData.live = true;

        this.newTurn(this.game.resolveTurn());

        this.io.to(this.roomName).emit('room update', this.dataToClient);

    }

    newTurn(data) {
        this.gameData.lockedIn = [];
        this.gameData.data = data;

        let livingPlayers = Object.values(data.players).filter(p => p.health > 0);

        this.gameData.live = livingPlayers.length > 1;

        if(!this.gameData.live) {
            if(livingPlayers.length == 0) {
                this.gameData.winner = '$nobody'
            } else {
                this.gameData.winner = Object.keys(data.players).find(p => data.players[p].health > 0);
            }
        }

        this.io.to(this.roomName).emit('room update', this.dataToClient);
        console.log(this.dataToClient);
    }

    actionSubmitted(player) { // this covers when a user submits an action that /does not/ advance the game to the next turn
        this.gameData.lockedIn.push(player);
        this.io.to(this.roomName).emit('room update', this.dataToClient);
    }

    submitAction(socket, action, target) {
        if (this.userList.includes(socket.userName)) {
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
        }
    }

    userLeave(socket) {
        let index = this.userList.indexOf(socket.userName);
        if (index > -1) {
            this.userList.splice(index, 1);
            socket.leave(this.roomName);
            socket.join('lobby');

            if (this.gameActive) {
                this.game.kill(socket.userName);
            }

            if (socket.userName == this.leader) {
                this.leader = this.userList[0];
                this.dataToClient.leader = this.leader;
            }
        }
    }

    message(socket, message) {
        if (this.userList.includes(socket.userName)) {
            message = message.replace(/[^a-zA-Z0-9 .,!?#$%^&*()+=_'";:/~-]/g, '');
            this.chatlog.push(`${socket.userName}: ${message}`);
            if (this.chatlog.length > 25) {
                this.chatlog.shift();
            }
        }
    }
}
 
module.exports = Room;