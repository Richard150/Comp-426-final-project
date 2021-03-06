const account_data = require('data-store')({path: process.cwd() + '/data/accounts.json' }); 

class Account {

    constructor(username, password) {
        this.username = username;
        this.password = password;
        this.wins = 0;
        this.gamesPlayed = 0;
        this.successfulAttacks = 0;
        this.failedAttacks = 0;
        this.successfulBlocks = 0;
        this.failedBlocks = 0;
        this.successfulCounters = 0;
        this.failedCounters = 0;
        this.successfulHeals = 0;
        this.failedHeals = 0;
        this.totalRepairs = 0;

        this.avatar = Math.floor(Math.random() * 42);

    }

    update() {
        account_data.set(this.username, this);
    }

    delete() {
        account_data.del(this.username);
    }

}

Account.delete = (username) => {
    let adata = account_data.get(username);
    if (adata == undefined) {
        return false;
    }
    account_data.del(username);
    return true;
}

Account.userExists = (username) => {
    let adata = account_data.get(username);
    if (adata == undefined) {
        return false;
    } else {
        return true;
    }
}

Account.setAvatar = (username, avatar) => {
    if (avatar > 41 || avatar < 0) { return undefined }
    
    let adata = account_data.get(username);
    if (adata == undefined) {
        return undefined;
    }
    adata.avatar = avatar;
    account_data.set(adata.username, adata);
    return true;
}

Account.addSucAttack = (username) => {
    let adata = account_data.get(username);
    if (adata == undefined) {
        return undefined;
    }
    adata.successfulAttacks++;
    account_data.set(adata.username, adata);
    return adata.successfulAttacks;
}

Account.addFailedAttack = (username) => {
    let adata = account_data.get(username);
    if (adata == undefined) {
        return undefined;
    }
    adata.failedAttacks++;
    account_data.set(adata.username, adata);
    return adata.failedAttacks;
}

Account.addSucBlock = (username) => {
    let adata = account_data.get(username);
    if (adata == undefined) {
        return undefined;
    }
    adata.successfulBlocks++;
    account_data.set(adata.username, adata);
    return adata.successfulBlocks;
}

Account.addFailedBlock = (username) => {
    let adata = account_data.get(username);
    if (adata == undefined) {
        return undefined;
    }
    adata.failedBlocks++;
    account_data.set(adata.username, adata);
    return adata.failedBlocks;
}

Account.addSucCounters = (username) => {
    let adata = account_data.get(username);
    if (adata == undefined) {
        return undefined;
    }
    adata.successfulCounters++;
    account_data.set(adata.username, adata);
    return adata.successfulCounters;
}

Account.addFailedCounters = (username) => {
    let adata = account_data.get(username);
    if (adata == undefined) {
        return undefined;
    }
    adata.failedCounters++;
    account_data.set(adata.username, adata);
    return adata.failedCounters;
}

Account.addSucHeals = (username) => {
    let adata = account_data.get(username);
    if (adata == undefined) {
        return undefined;
    }
    adata.successfulHeals++;
    account_data.set(adata.username, adata);
    return adata.successfulHeals;
}

Account.addFailedHeals = (username) => {
    let adata = account_data.get(username);
    if (adata == undefined) {
        return undefined;
    }
    adata.failedHeals++;
    account_data.set(adata.username, adata);
    return adata.failedHeals;
}

Account.addRepair = (username) => {
    let adata = account_data.get(username);
    if (adata == undefined) {
        return undefined;
    }
    adata.totalRepairs++;
    account_data.set(adata.username, adata);
    return adata.totalRepairs;
}

Account.addWin = (username) => {
    let adata = account_data.get(username);
    if (adata == undefined) {
        return undefined;
    }
    adata.wins++;
    account_data.set(adata.username, adata);
    return adata.wins;
}

Account.addGamesPlayed = (username) =>{
    let adata = account_data.get(username);
    if (adata == undefined) {
        return undefined;
    }
    adata.gamesPlayed++;
    account_data.set(adata.username, adata);
    return adata.gamesPlayed;
}

Account.getAvatar = (username) => {
    let adata = account_data.get(username);
    if (adata == undefined) {
        return undefined;
    }
    return adata.avatar;
}

Account.getPassword = (username) => {
    let adata = account_data.get(username);
    if (adata == undefined) {
        return undefined;
    }
    return adata.password;
}

Account.getWins = (username) => {
    let adata = account_data.get(username);
    if (adata == undefined) {
        return undefined;
    }
    return adata.wins;
}

Account.getGamesPlayed = (username) => {
    let adata = account_data.get(username);
    if (adata == undefined) {
        return undefined;
    }
    return adata.gamesPlayed;
}

Account.getSucAttacks = (username) => {
    let adata = account_data.get(username);
    if (adata == undefined) {
        return undefined;
    }
    return adata.successfulAttacks;
}

Account.getFailedAttacks = (username) => {
    let adata = account_data.get(username);
    if (adata == undefined) {
        return undefined;
    }
    return adata.failedAttacks;
}

Account.getSucBlocks = (username) => {
    let adata = account_data.get(username);
    if (adata == undefined) {
        return undefined;
    }
    return adata.successfulBlocks;
}

Account.getFailedBlocks = (username) => {
    let adata = account_data.get(username);
    if (adata == undefined) {
        return undefined;
    }
    return adata.failedBlocks;
}

Account.getSucCounters = (username) => {
    let adata = account_data.get(username);
    if (adata == undefined) {
        return undefined;
    }
    return adata.successfulCounters;
}

Account.getFailedCounters = (username) => {
    let adata = account_data.get(username);
    if (adata == undefined) {
        return undefined;
    }
    return adata.failedCounters;
}

Account.getSucHeals = (username) => {
    let adata = account_data.get(username);
    if (adata == undefined) {
        return undefined;
    }
    return adata.successfulHeals;
}

Account.getFailedHeals = (username) => {
    let adata = account_data.get(username);
    if (adata == undefined) {
        return undefined;
    }
    return adata.failedHeals;
}

Account.getTotalRepairs = (username) => {
    let adata = account_data.get(username);
    if (adata == undefined) {
        return undefined;
    }
    return adata.totalRepairs;
}

Account.getAllUsers = () => {
    return Object.keys(account_data.data);
    // returns array of all account ID's
}

Account.getAllAvatars = () => {
    return Object.values(account_data.data).map(u => u.avatar);
}

Account.getAllUsersAndAvatars = () => {
    return Object.values(account_data.data).map(u => {
        let str = '0' + u.avatar;
        str = str.slice(-2);
        str = str + u.username;
        return str;
    })
}

Account.findByUsername = (username) => {
    let adata = account_data.get(username);
    if (adata == undefined) {
        return undefined;
    }
    return adata;
}

Account.create = (username, password, avatar) => {
    if (Object.keys(account_data.data).filter(nextUser => nextUser == username).length > 0) {
        return undefined;
    }
    let a = new Account(username, password);
    account_data.set(a.username, a);
    return a;
}

module.exports = Account;