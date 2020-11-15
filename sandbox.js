const Game = require('./Game');

let names = ['abbey', 'benji', 'claire'];

let game = new Game(names);

sa('abbey', 'attack', 'benji');
sa('benji', 'counter');
sa('claire', 'heal');

sa('abbey', 'attack', 'benji');
sa('benji', 'attack', 'claire');
sa('claire', 'attack', 'benji');

sa('abbey', 'heal');
sa('benji', 'counter');
sa('claire', 'counter');

sa('abbey', 'attack', 'claire');
sa('claire', 'heal');
sa('benji', 'heal');

sa('abbey', 'heal');
sa('claire', 'counter');

sa('abbey', 'counter');
sa('abbey', 'counter');
sa('abbey', 'counter');

function sa(name, action, target) {
    game.submitAction(name, action, target);
}