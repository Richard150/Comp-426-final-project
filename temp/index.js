const express = require('express');

const app = express();

const Account = require('./Account');

const bodyParser = require('body-parser');
app.use(bodyParser.json());

app.get('/account', (req, res) => {
    res.json(Account.getAllIds());
    return;
});

app.get('/account/:id', (req, res) => {
    let a = Account.findByID(req.params.id);
    if (a == null) {
        res.status(404).send("Account not found");
        return;
    }
    res.json(a);
})

app.post('/account', (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    let a = Account.create(username, password);
    if (a == null) {
        res.status(400).send("Bad Request");
        return;
    }
    return res.json(a);
})

app.put('/account/:id', (req, res) => {
    let a = Account.findByID(req.params.id);
    if (a == null) {
        res.status(404).send("Account not found");
        return;
    }

    let username = req.body.username;
    let password = req.body.password;
    a.username = username;
    a.password = password;

    a.update();

    res.json(a);
})

app.delete('/account/:id', (req, res) => {
    let a = Account.findByID(req.params.id);
    if (a == null) {
        res.status(404).send("Account not found");
        return;
    }
    a.delete();
    res.json(true);
})

const port = 3030;
app.listen(port, () => {
    console.log("up and running on port " + port)
});