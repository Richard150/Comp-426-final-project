const account_data = require('data-store')({path: process.cwd() + '/data/accounts.json' }); 

class Account {

    constructor(id, owner, wins, losses) {
        this.id = id;
        this.owner = owner;
        this.wins = wins;
        this.losses = losses;
    }

    update() {
        account_data.set(this.id.toString(), this);
    }

    delete() {
        account_data.del(this.id.toString());
    }

}

Account.getAllIds = () => {
    return Object.keys(account_data.data).map(id => { return parseInt(id);} );
    // returns array of all account ID's
}

Account.getAllIdsForOwner = (owner) => {
    return Object.keys(account_data.data).filter(id => account_data.get(id).owner == owner).map(id => { return parseInt(id);} );
}

Account.findByID = (id) => {
    let adata = account_data.get(id);
    if (adata == null) {
        return null;
    }
    return new Account(adata.id, adata.owner, adata.wins, adata.losses);
}

Account.next_id = Account.getAllIds().reduce((max, nextId) => {
    if (max < nextId) {
        return nextId;
    }
    return max;
}, -1) + 1;

Account.create = (owner) => {
    let id = Account.next_id;
    Account.next_id += 1;
    let a = new Account(id, owner, 0, 0);
    account_data.set(a.id.toString(), a);
    return a;
}

module.exports = Account;