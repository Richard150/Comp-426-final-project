const Game = require("./Game");

class Room {
    constructor(creatorSocket, roomName) {
        this.userList = [];
        this.roomName = roomName;
        this.chatlog = [];
        // this.gameActive = false;

        this.leader = creatorSocket.userName;
    }

    createGame() {
        // this.game = new Game(this.userList);
        // this.gameActive = true;
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
            // if (this.gameActive) {
            //     this.game.kill(socket.userName);
            // }

            if (socket.userName == this.leader) {
                this.leader = this.userList[0];
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