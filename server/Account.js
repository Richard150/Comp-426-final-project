const account_data = require('data-store')({path: process.cwd() + '/data/accounts.json' }); 

class Account {

    constructor(username, password, wins, losses) {
        this.username = username;
        this.password = password;
        this.wins = wins;
        this.losses = losses;
    }

    update() {
        account_data.set(this.username, this);
    }

    delete() {
        account_data.del(this.username);
    }

}

Account.userExists = (username) => {
    let adata = account_data.get(username);
    if (adata == null) {
        return false;
    } else {
        return true;
    }
}

Account.getPassword = (username) => {
    return account_data.get(username).password;
}

Account.getWins = (username) => {
    return account_data.get(username).wins;
}

Account.getLosses = (username) => {
    return account_data.get(username).losses;
}

Account.getAllUsers = () => {
    return Object.keys(account_data.data).map(username => { return username} );
    // returns array of all account ID's
}

Account.findByUsername = (username) => {
    let adata = account_data.get(username);
    if (adata == null) {
        return null;
    }
    return new Account(adata.username, adata.password, adata.wins, adata.losses);
}

Account.create = (username, password) => {
    if (Object.keys(account_data.data).filter(nextUser => nextUser == username)) {
        return null;
    }
    let a = new Account(username, password, 0, 0);
    account_data.set(a.username, a);
    return a;
}

module.exports = Account;