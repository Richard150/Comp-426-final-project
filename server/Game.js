const Account = require('./Account');

class Game {
    constructor(userList) {
        this.playerList = [];
        userList.forEach(user => {
            this.playerList.push(makePlayer(user));
        });

        this.actionList = [];
    }

    submitAction(playerName, action, target = undefined) {
        let player = this.playerList.find(p => p.userName == playerName && p.health > 0);
        let playerTarget = this.playerList.find(p => p.userName == target && p.health > 0);
        let playerExists = player != undefined;
        let playerTargetExists = target != undefined && playerTarget != undefined;

        if (playerExists && (action == 'attack' && playerTargetExists || // can only attack if your target exists & is alive
                             action == 'block' && player.shieldReady || // can only block if your shield is up
                             action == 'repair' && !player.shieldReady || // can only repair if your shield is down
                             action == 'heal' && player.health < 4 || // can only heal if you're not at max health
                             action == 'counter' || // can only counter if you're brave enough
                             action == 'die')) { // called when a user leaves a room with an active game
            player.action = action;
            player.target = playerTarget;

            if (action == 'attack') {
                playerTarget.attackers.push(player);
            }

            if (this.playerList.findIndex(p => p.action == 'undecided' && p.health > 0) == -1) {
                let data = this.resolveTurn();
                return data;
            } else {
                return 'accepted'
            }
        } else {
            return 'rejected'
        }
    }

    // kill(playerName) {
    //     let idx = this.playerList.indexOf(p => p.userName == playerName && p.health > 0);
    //     if (idx != -1) {
    //         this.playerList[idx].health = 0;
            
    //         if (this.playerList.findIndex(p => p.action == 'undecided' && p.health > 0) == -1) {
    //             this.resolveTurn();
    //         }
    //     }
    // }

    resolveTurn() {
        this.actionList = [];
        this.playerList.forEach(player => {
            switch (player.action) {

                case 'attack':
                    switch (player.target.action) {

                        case 'block':
                            this.updateTurnSummary('blocked attack', player, player.target); // target blocked player's attack
                            Account.addFailedAttack(player.userName);
                            Account.addSucBlock(player.target.userName);
                            break;

                        case 'counter':
                            this.updateTurnSummary('countered attack', player, player.target); // target countered player's attack
                            player.health--;
                            Account.addFailedAttack(player.userName);
                            Account.addSucCounters(player.target.userName);
                            break;

                        case 'heal':
                            this.updateTurnSummary('heal interrupted', player, player.target); // target tried to heal, but was attacked by player
                            player.target.health--;
                            Account.addSucAttack(player.userName);
                            Account.addFailedHeals(player.target.userName);
                            break;

                        default:
                            this.updateTurnSummary('attacked', player, player.target); // player attacked target
                            Account.addSucAttack(player.userName);
                            player.target.health--;
                    }
                    break;

                case 'block':
                    player.shieldReady = player.attackers.length == 0;
                    if (player.shieldReady) {
                        this.updateTurnSummary('blocked nothing', player); // player blocked for no reason
                        Account.addFailedBlock(player.userName);
                    }
                    break;

                case 'repair':
                    player.shieldReady = true;
                    this.updateTurnSummary('repaired', player); // player repaired their shield
                    Account.addRepair(player.userName);
                    break;

                case 'counter':
                    if (player.attackers.length == 0) {
                        player.health--;
                        this.updateTurnSummary('countered nobody', player); // player countered for no reason
                        Account.addFailedCounters(player.userName);
                    }
                    break;

                case 'heal':
                    if (player.attackers.length == 0) {
                        player.health++;
                        this.updateTurnSummary('healed', player); // player healed
                        Account.addSucHeals(player.userName);
                    } // for block, counter, and heal, we dont need to have an else statement since we handle that case when looking at the attacker
                    break;

                case 'die':
                    player.health = 0;
                    this.updateTurnSummary('died', player); // player died suddenly
                    break;

                default:
                    this.updateTurnSummary('idled', player); // player didn't do anything
            }
        });

        let data = {};
        data.summary = this.actionList;
        data.players = {};

        this.playerList.forEach(p => {
            let action = '';
            if (p.action == 'attack') {
                action = p.target;
            } else {
                action = p.action;
            }

            let availableActions = ['attack', 'counter'];
            availableActions.push(p.shieldReady ? 'block' : 'repair');
            if (p.health < 4) {
                availableActions.push('heal');
            }

            data.players[p.userName] = {
                action: p.action == 'attack' ? p.target.userName : p.action,
                health: p.health,
                shieldReady: p.shieldReady,
                availableActions: availableActions
            };

            p.action = 'undecided';
            p.target = '$none';
            p.attackers = [];
            
        });
        
        return data;
    }

    updateTurnSummary(connection, p1, p2) {
        let player1 = p1 != undefined ? p1.userName : '';
        let player2 = p2 != undefined ? p2.userName : '';
        switch(connection) {

            case 'attacked': 
                this.actionList.push(`${player1} attacked ${player2}`);
                break;

            case 'blocked attack': 
                this.actionList.push(`${player2} blocked ${player1}'s attack`);
                break;

            case 'countered attack': 
                this.actionList.push(`${player2} countered ${player1}'s attack`);
                break;

            case 'heal interrupted': 
                this.actionList.push(`${player2} tried to heal, but was attacked by ${player1}`);
                break;

            case 'blocked nothing':
                this.actionList.push(`${player1} blocked for no reason`);
                break;

            case 'countered nobody': 
                this.actionList.push(`${player1} countered for no reason`);
                break;

            case 'repaired': 
                this.actionList.push(`${player1} repaired their shield`)
                break;

            case 'healed':
                this.actionList.push(`${player1} healed`)
                break;

            case 'died':
                this.actionList.push(`${player1} died suddenly`);
                break;

            case 'idled': 
                if(p1.health > 0) this.actionList.push(`${player1} twiddled their thumbs`);
                break;
        }        
    }
}

function makePlayer(name) {
    return {
        userName: name,
        health: 3,
        shieldReady: true,
        action: 'undecided',
        target: '$none',
        attackers: []
    }
}

module.exports = Game;