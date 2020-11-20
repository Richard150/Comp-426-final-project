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
        let gameData = roomdata.gameData;           // object containing information about the game
        let gameLive = gameData.live;               // "true" if there is a game going on. "false" if there is not
        let lockedIn = gameData.lockedIn;           // array of usernames of players who submitted their commands
        let winner = gameData.winner;               // name of game winner. empty string if no winner yet, "$nobody" if everybody died
        let turnSummary = gameData.data.summary;    // array of strings describing what happened the previous turn (indexed 0, 1, ...) (ex: 'alice blocked bob's attack')
        let players = gameData.data.players;        // object containing player information, indexed by player name

        /**
         * players['bob'].health = bob's health (0, 1, 2, 3, 4)
         * players['bob'].action = what bob did last turn; if bob attacked, this will be the name of the player bob attacked
         * players['bob'].shieldReady = true if bob can block, false if bob cant block
         * players['bob'].availableActions = array of actions bob can make 
         *                                   (can always attack/counter, can only heal under 4 hp, can only block with shield up, repair with shield down)
         */

        let userList = usernames.reduce((acc, curr) => acc += curr == leader ? `<br>${curr} (Host)` : `<br>${curr}`, '<strong>users online:</strong>');
        $('.usersinroom').html(userList);
        $('.chatbox').html(chatlog.reduce((acc, curr) => acc += `<br>${curr}`, '<strong>chat history:</strong>'));


    });

    $('.availablerooms').on("click", ".roombutton", function(){
        let buttonid = $(this).attr('id');
        let roomname = buttonid.slice(5);
        joinRoom(roomname);
    });

    $('#leaveroombutton').click(function(){
        socket.emit('leave room', currentRoom);
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