const account_data = require('data-store')({path: process.cwd() + '/data/account.json' }); 

class Account {

    constructor(id, username, password) {
        this.id = id;
        this.username = username;
        this.password = password;
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

Account.findByID = (id) => {
    let adata = account_data.get(id);
    if (adata == null) {
        return null;
    }
    return new Account(adata.id, adata.username, adata.password);
}

Account.next_id = Account.getAllIds().reduce((max, nextId) => {
    if (max < nextId) {
        return nextId;
    }
    return max;
}, -1) + 1;

Account.create = (username, password) => {
    let id = Account.next_id;
    Account.next_id += 1;
    let a = new Account(id, username, password);
    account_data.set(a.id.toString(), a);
    return a;
}

module.exports = Account;