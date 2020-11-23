const avatars = ['Archer', 'BlackKnight', 'Cavalier', 'Centaur', 'Cyclops', 'Deer', 
                 'Demon', 'Devil', 'Djinn', 'Druid', 'Dwarf', 'Efreet', 'Gargoyle', 
                 'Ghost', 'Goblin', 'Gog', 'Golem', 'Gremlin', 'Griffin', 'Harpy', 
                 'HellHound', 'Hunter', 'Imp', 'Lich', 'Mage', 'Monk', 'Naga', 
                 'Paladin', 'Pikeman', 'PitFiend', 'Pixie', 'Satyr', 'Shaman', 
                 'Skeleton', 'Spider', 'Swordsman', 'Titan', 'Treant', 'Troll', 
                 'Vampire', 'WolfRider', 'Zombie'];
$(function () {
    let socket = io();
    let myName = '';
    let currentRoom = 'lobby';

    $('form').submit(function(e) {
        e.preventDefault();
    });

    $('form.createroomform').submit(function(e){
        let roomname = $('#roomnamefield').val();
        e.preventDefault();
        $('#lobbyDiv').addClass('hidden');
        socket.emit('create room', roomname);
        joinRoom(roomname);
        
    });

    $('form.chatform').submit(function(e) {
        e.preventDefault();
        let message = $('#chatmessagefield').val();
        $('#chatmessagefield').val('');
        socket.emit('send message', message);
    });

    // socket.on('online count', function(usersOnline) {
    //     $('#oc').html(usersOnline);
        
    // });

    socket.on('lobby update', function(lobbyInfo) {
        let usernames = lobbyInfo.usernames;
        let rooms = lobbyInfo.rooms;

        let userList = usernames.reduce((acc, curr) => acc += `<br>${curr}`, '<h2 class="hidden">Users Online:</h2>');
        $('.everybodyonline').html(userList)

        let roomList = rooms.reduce((acc, curr) => acc += `<br><button class="roombutton" id="room-${curr}">Join ${curr}</button>`, '<h2>Join a room or create your own!</h2>');
        $('.availablerooms').html(roomList);
    })

    let $timerDisplay = $(`<div></div>`);
    let timeLeft = 15;
    setInterval(function() {
        if (timeLeft > 0) timeLeft -= 0.1;
        let str = '' + (Math.round(timeLeft * 10) / 10) + '.0';
        str = str.substring(0,3);
        $timerDisplay.text(str + ' seconds remaining!');
    },100)

    socket.on('room update', function(roomdata) {
        let chatlog = roomdata.chatlog;             // array of messages to display in chat (indexed 0, 1, ...)
        let usernames = roomdata.usernames;         // array of usernames in the room (indexed 0, 1, ...)
        let leader = roomdata.leader;               // name of room leader
        let gameData = roomdata.game;               // object containing information about the game
        let gameLive = gameData.live;               // "true" if there is a game going on. "false" if there is not
        let lockedIn = gameData.lockedIn;           // array of usernames of players who submitted their commands
        let winner = gameData.winner;               // name of last game's winner. empty string if no winner yet, "$nobody" if everybody died
        let turnSummary = gameData.data.summary;    // array of strings describing what happened the previous turn (indexed 0, 1, ...) (ex: 'alice blocked bob's attack')
        let players = gameData.data.players;        // object containing player information, indexed by player name
        let event = roomdata.event;                 // string describing what happened in the room:
                                                    // 'new turn', 'new message', 'user joined', 'user left', 'created room', and 'action submitted'

        if (event == 'new turn') timeLeft = 15;

        console.log('room update');
        console.log(roomdata);

        /**
         * players['bob'].health = bob's health (0, 1, 2, 3, 4)
         * players['bob'].action = what bob did last turn; if bob attacked, this will be the name of the player bob attacked
         * players['bob'].shieldReady = true if bob can block, false if bob cant block
         * players['bob'].availableActions = array of actions bob can make 
         *                                   (can always attack/counter, can only heal under 4 hp, can only block with shield up, repair with shield down)
         */

        // render chat & userlist
        let userList = usernames.reduce((acc, curr) => acc += curr == leader ? `<br>${curr} (Host)` : `<br>${curr}`, '<strong>Users Online:</strong>');
        $('.usersinroom').html(userList);
        $('.chatbox').html(chatlog.reduce((acc, curr) => acc += `<br>${curr}`, '<strong class="hidden">Chat</strong>'));

        // render game
        let summary = turnSummary.reduce((acc, curr) => acc += `<br>${curr}`, '<strong class="statutTitle hidden">Turn Summary:</strong>');
        $('.turnsummary').html(summary);

        let livingPlayers = [];
        let $status = $('.playerstatus');
        $status.html('');
        $status.append('<strong class="statutTitle hidden">Player Status:</strong>');
        Object.keys(players).forEach(p => {
            $status.append(`<br>${p} `);

            if (players[p].health < 1) {
                $status.append('☠');
            } else {
                livingPlayers.push(p);
                for (let i = 0; i < players[p].health; i++) $status.append('♥');
                if (players[p].shieldReady) $status.append('🛡');
            }

            if (lockedIn.includes(p)) $status.append(' (choice made!)');
        });

        if (winner != '' && livingPlayers.length == 1) {
            $status.append(`<br>${livingPlayers[0]} won!`);
        } else if (winner != '' && livingPlayers.length == 0) {
            $status.append(`<br>Nobody won, it's a tie!`);
        }

        let $actionmenu = $('.actionmenu');
        $actionmenu.html('');
        $actionmenu.append('<strong class="actionTitle">Select an action:</strong>');
        if (gameLive && livingPlayers.includes(myName)) {
            if (lockedIn.includes(myName)) {
                $actionmenu.append('<br>waiting for others...');
            } else {
                players[myName].availableActions.forEach(action => {
                    if (action != 'attack') {
                        $actionmenu.append(`<br><button class='choicebutton' id='b-${action}'>${action}</button>`);
                        $(`#b-${action}`).on('click', function() {
                            socket.emit('send action', action);
                        });
                    }
                });

                livingPlayers.forEach(target => {
                    if (target != myName) {
                        $actionmenu.append(`<br><button class='choicebutton' id='b-${target}'>attack ${target}</button>`);
                        $(`#b-${target}`).on('click', function() {
                            socket.emit('send action', target);
                        });
                    }
                });
                $actionmenu.append($timerDisplay);
            }
        } else {
            if (!gameLive && myName != leader) {
                $actionmenu.append('<br>Waiting for host to start the game...');
            } else if (!gameLive && myName == leader) {
                $actionmenu.append(`<br><button id='startgame'>Start Game</button>`);
                $('#startgame').on('click', function() {
                    socket.emit('start game');
                });
            } else {
                $actionmenu.append('<br>Waiting for next game...');
            }
        }

    });

    $('.availablerooms').on("click", ".roombutton", function(){
        let buttonid = $(this).attr('id');
        let roomname = buttonid.slice(5);
        joinRoom(roomname);
    });

    $('#leaveroombutton').click(function(){
        socket.emit('leave room');
        currentRoom = 'lobby';
        $('#lobbyDiv').removeClass('hidden');
        $('.lobby').removeClass('hidden');
        $('#gameScreen').addClass('hidden');
        $('.everybodyonline').removeClass('hidden');
    })

    function joinRoom(roomname) {
        currentRoom = roomname;
        socket.emit('join room', roomname);
        $('#lobbyDiv').addClass('hidden');
        $('.lobby').addClass('hidden');
        $('.roomchat').removeClass('hidden');
        $('.everybodyonline').addClass('hidden');
    };

    $("#viewProfile").on('click', (e) =>{
        socket.emit('request profile info', myName);
        // $('#profileDiv').removeClass('hidden');
        // $('#lobbyDiv').addClass('hidden');
        // $('#gameScreen').addClass('hidden');
    });

    function loadProfile(profile) {
        $('#profileDiv').removeClass('hidden');
        $('#avatarDiv').addClass('hidden');
        $('#lobbyDiv').addClass('hidden');
        $('#gameScreen').addClass('hidden');

        $('#profileAvatar').html(`<img style='width:160px;height:160px' src='/avatars/Icon${avatars[profile.avatar]}.png' alt=${avatars[profile.avatar]}>`)
        let keys = Object.keys(profile);
        keys.forEach(key => {
            $(`span.${key}`).text(profile[key]);
        });
    }

    socket.on('profile info', profile => {

        loadProfile(profile);

    });

    $('.lobbyReturn').on('click', (e) =>{
        $('#profileDiv').addClass('hidden');
        $('#lobbyDiv').removeClass('hidden');
        $('#rulesDiv').addClass('hidden');
    });

    $("#viewRules").on('click', (e) => {
        $('#lobbyDiv').addClass('hidden');
        $('#rulesDiv').removeClass('hidden');
    })

    $('#loginButton').on('click', (e) =>{
        let username1 = $('#userNameInput').val();
        let password1 = $('#passwordInput').val();
        let credentials = {
            username: username1,
            password: password1
        }

        myName = username1;

        socket.emit('login', credentials);
    });

    socket.on('login successful', () => {
        $('#lobbyDiv').removeClass('hidden');
        $('#welcomeDiv').addClass('hidden');
    });

    socket.on('login unsuccessful', () => {
        $('#failedLogin').removeClass('hidden');
    });

    $('#newAccount').on('click', (e) => {
        $('#welcomeDiv').addClass('hidden');
        $('#newUserDiv').removeClass('hidden');
    });

    $('#makeAccount').on('click', (e) =>{
        let username2 = $('#newNameInput').val();
        let password2 = $('#newPasswordInput').val();
        let credentials = {
            username: username2,
            password: password2
        }

        myName = username2;

        socket.emit('signup', credentials);
    });

    $('#signupBackButton').on('click', () => {
        $('#newUserDiv').addClass('hidden');
        $('#welcomeDiv').removeClass('hidden');
    });
    
    socket.on('signup successful', () => {
        $('#lobbyDiv').removeClass('hidden');
        $('#newUserDiv').addClass('hidden');
    });
    
    socket.on('signup unsuccessful', ()=>{
        $('#failedSignup').removeClass('hidden');
    });

    $('#chooseAvatar').on('click', () => {
        $('#profileDiv').addClass('hidden');
        $('#avatarDiv').removeClass('hidden');
    })

    $('#avatarDiv').on('click', '.avatarSelect', function() {
        let choice = $(this).text();
        choice = choice.replace(/\s/g, '');
        let avatarID = avatars.indexOf(choice);
        socket.emit('change avatar', avatarID);
        socket.emit('request profile info', myName);
    });
});