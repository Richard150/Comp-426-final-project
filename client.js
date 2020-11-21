//commeting to see if things will work
$(function () {
    let socket = io();
    let myName = '';
    let currentRoom = 'lobby';

    $('form.nameform').submit(function(e){
        e.preventDefault();
        socket.emit('choose name', $('#namefield').val());
        myName = $('#namefield').val();
        $('form.nameform').remove();
        $('.lobby').removeClass('hidden');
    });

    $('form.createroomform').submit(function(e){
        let roomname = $('#roomnamefield').val();
        e.preventDefault();
        socket.emit('create room', roomname);
        joinRoom(roomname);
    });

    $('form.chatform').submit(function(e) {
        e.preventDefault();
        let message = $('#chatmessagefield').val();
        $('#chatmessagefield').val('');
        socket.emit('send message', message);
    });

    socket.on('online count', function(usersOnline) {
        $('#oc').html(usersOnline);
    });

    socket.on('new name list', function(usernames) {
        let userList = usernames.reduce((acc, curr) => acc += `<br>${curr}`, '<h2>users online:</h2>');
        $('.everybodyonline').html(userList)
    });

    socket.on('roomlist update', function(rooms) {
        let roomList = rooms.reduce((acc, curr) => acc += `<br><button class="roombutton" id="room-${curr}">Join ${curr}</button>`, '<h2>available rooms to join:</h2>');
        $('.availablerooms').html(roomList);
    });

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

        console.log('room update:');
        console.log(roomdata);

        /**
         * players['bob'].health = bob's health (0, 1, 2, 3, 4)
         * players['bob'].action = what bob did last turn; if bob attacked, this will be the name of the player bob attacked
         * players['bob'].shieldReady = true if bob can block, false if bob cant block
         * players['bob'].availableActions = array of actions bob can make 
         *                                   (can always attack/counter, can only heal under 4 hp, can only block with shield up, repair with shield down)
         */

        // render chat & userlist
        let userList = usernames.reduce((acc, curr) => acc += curr == leader ? `<br>${curr} (Host)` : `<br>${curr}`, '<strong>users online:</strong>');
        $('.usersinroom').html(userList);
        $('.chatbox').html(chatlog.reduce((acc, curr) => acc += `<br>${curr}`, '<strong>chat history:</strong>'));

        // render game
        let summary = turnSummary.reduce((acc, curr) => acc += `<br>${curr}`, '<strong>turn summary:</strong>');
        $('.turnsummary').html(summary);

        let livingPlayers = [];
        let $status = $('.playerstatus');
        $status.html('');
        $status.append('<strong>player status:</strong>');
        Object.keys(players).forEach(p => {
            $status.append(`<br>${p} `);

            if (players[p].health < 1) {
                $status.append('☠');
            } else {
                livingPlayers.push(p);
                for (let i = 0; i < players[p].health; i++) {
                    $status.append('♥');
                }
                if (players[p].shieldReady) {
                    $status.append('🛡');
                }
            }

            if (lockedIn.includes(p)) {
                $status.append(' <em>(choice made!)</em>')
            }
        });

        if (winner != '' && livingPlayers.length == 1) {
            $status.append(`<br>${livingPlayers[0]} won!`);
        } else if (winner != '' && livingPlayers.length == 0) {
            $status.append(`<br>Nobody won, it's a tie!`);
        }

        let $actionmenu = $('.actionmenu');
        $actionmenu.html('');
        $actionmenu.append('<strong>select an action:</strong>');
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
            }
        } else {
            if (!gameLive && myName != leader) {
                $actionmenu.append('<br>Waiting for host to start the game...');
            } else if (!gameLive && myName == leader) {
                $actionmenu.append(`<br><button id='startgame'>start game</button>`);
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
        $('.lobby').removeClass('hidden');
        $('.roomchat').addClass('hidden');
    })

    function joinRoom(roomname) {
        currentRoom = roomname;
        socket.emit('join room', roomname);
        $('.lobby').addClass('hidden');
        $('.roomchat').removeClass('hidden');
    };
});