class Player {
    constructor(userName) {
        this.userName = userName;
        this.health = 3;
        this.shieldReady = true;
        this.action = 'undecided';
    }
}

module.exports = Player;