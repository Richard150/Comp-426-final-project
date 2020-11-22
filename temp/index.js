// thing with secret
const express = require('express');

const app = express();

const cors = require('cors');

const Account = require('./Account');

const bodyParser = require('body-parser');
app.use(bodyParser.json());

app.use(cors());

const expressSession = require('express-session');
app.use(expressSession({
    name: "rjSessionCookie",
    secret: "express session secret",
    resave: false,
    saveUninitialized: false
}))

const login_data = require('data-store')({path: process.cwd() + '/data/remember.json' }); 

app.post('/login', (req, res) => {
    
    let user = req.body.user;
    let password = req.body.password;

    let user_data = login_data.get(user);
    if (user_data == null) {
        res.status(404).send("Not found");
    }
    
    if (user_data.password == password) {
        console.log("User " + user + " credentials valid");
        req.session.user = user;
        res.json(true);
        return;
    }

    res.status(403).send("Unauthorized");
})

app.post('/signup', (req, res) => {
    
    let user = req.body.user;
    let password = req.body.password;
    console.log(user);
    console.log(password);

    let user_data = login_data.get(user);
    console.log(user_data);
    if (login_data.get(user) != null) {
        res.status(404).send("Username already exists");
        return;
    }

    let a = Account.create(user);
    if (a == null) {
        res.status(400).send("Bad Request");
        return;
    }

    login_data.set(user, {password});
    req.session.user = user;
    res.json(true);
})

app.get('/logout', (req, res) => {
    delete req.session.user;
    res.json(true);
})

app.get('/account', (req, res) => {
    if (req.session.user == undefined) {
        res.status(403).send("Unauthorized");
        return;
    }
    res.json(Account.getAllIdsForOwner(req.session.user));
    return;
});

app.get('/account/:id', (req, res) => {
    if (req.session.user == undefined) {
        res.status(403).send("Unauthorized");
        return;
    }

    let a = Account.findByID(req.params.id);
    if (a == null) {
        res.status(404).send("Account not found");
        return;
    }

    if (a.owner != req.session.user) {
        res.status(403).send("Unauthorized");
        return;
    }

    res.json(a);
})

app.post('/account', (req, res) => {
    if (req.session.user == undefined) {
        res.status(403).send("Unauthorized");
        return;
    }
    
    let owner = req.session.user;

    let a = Account.create(owner);
    if (a == null) {
        res.status(400).send("Bad Request");
        return;
    }
    return res.json(a);
})

app.put('/account/:id', (req, res) => {
    if (req.session.user == undefined) {
        res.status(403).send("Unauthorized");
        return;
    }
    
    let a = Account.findByID(req.params.id);
    if (a == null) {
        res.status(404).send("Account not found");
        return;
    }
    if (a.owner != req.session.user) {
        res.status(403).send("Unauthorized");
        return;
    }

    let owner = req.body.owner;
    let wins = req.body.wins;
    let losses = req.body.losses;
    a.owner = owner;
    a.wins = wins;
    a.losses = losses
    
    a.update();

    res.json(a);
})

app.delete('/account/:id', (req, res) => {
    if (req.session.user == undefined) {
        res.status(403).send("Unauthorized");
        return;
    }
    
    let a = Account.findByID(req.params.id);
    if (a == null) {
        res.status(404).send("Account not found");
        return;
    }
    if (a.owner != req.session.user) {
        res.status(403).send("Unauthorized");
        return;
    }

    a.delete();
    res.json(true);
})

const port = 3005;
app.listen(port, () => {
    console.log("up and running on port " + port)
});
