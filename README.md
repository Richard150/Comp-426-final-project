# Colosseum

Colosseum is a fun online game made by:

Noah Van Hook

Emilia Patiño

Philip Wall

Richard Johnson

...with artwork courtesy of HAS Creature Pack by Aleksandr Makarov!

The game can be played here: http://colosseumgame.herokuapp.com/

## socket&#46;io events
#### Client to Server
| Event Name | Data sent | Description | Confirmation Response | Error Response |
| ------ | ------ | - | - | - |
| disconnect | N/A | logs the client out | lobby update | N/A
| create room | string | creates a room with the name sent by the client | lobby update | N/A
| join room | string | joins the room with the name sent by the client (if it exists) | room update | N/A
| leave room | N/A | leaves the room the client is in | room update | N/A
| start game | N/A | the host of a room starts the game | room update | N/A
| send message | string | sends a message to the room the client is in | room update | N/A
| send action | string | submits action chosen by the player | room update | N/A
| login | {username, password} | logs client in if credentials are correct | lobby update, login successful, everybody | login unsuccessful
| signup | {username, password} | creates new account with username and password as long as username is accepted | account created, lobby update, everybody, signup successful | signup unsuccessful
| request profile info | string | asks for user info of username | profile info | profile request denied
| change avatar | integer | sends ID of avatar the user wants | avatar changed, lobby update | N/A |
| delete profile | N/A | deletes client profile | account deleted, lobby update | N/A |

#### Server to client
| Event name | Data sent | What this is | When you get this
| - | - | - | - |
| everybody | array of strings | strings are of format [0-padded-avatarID][username]; array is of ALL users | when you login/signup |
| account deleted | string | name of user who deleted their account | when anybody deletes their account |
| avatar changed | {username, avatar} | object containing name of user who changed their avatar, id of avatar they selected | when anybody changes their avatar |
| account created | {username, avatar} | object with name and avatar id of new user | when anybody signs up |
| lobby update | {usernames, rooms} | object containing array of usernames of users currently online, and array of rooms currently available | when either array changes |
| room update | roomdata object (documented below) | object containing all information about the current room | when you first join a room, and when the room is updated while you are in it |
| profile request denied | N/A | N/A | when you ask to see a profile that does not exist |
| profile info | profile object (documented below) | object containing all information about a profile | when you request to see a profile |
| signup successful | N/A | N/A | when your account is created successfully
| signup unsuccessful | N/A | N/A | when you sign up with a username that is taken or not allowed
| login successful | N/A | N/A | when you log in successfully
| login unsuccessful | N/A | N/A | when your credentials are incorrect |

### roomdata
```
roomdata.chatlog: array of messages to display in chat
roomdata.usernames: array of usernames in the room
roomdata.leader: name of room leader
roomdata.event: string describing what happened in the room
                ('new turn', 'new message', 'user joined', 'user left', 'created room', 'action submitted')
roomdata.game: object containing information about the game
roomdata.game.live: "true" if there is a game going on, "false" if there is not
roomdata.game.lockedIn: array of usernames of player who have submitted their commands
roomdata.game.winner: name of last game's winner. '' if nobody has won yet, '$nobody' if everybody died
roomdata.game.summary: array of strings describing what happened the previous turn (ex: 'alice countered bob's attack)
roomdata.game.players: object containing info about each player
roomdata.game.players['bob'].health: integer representing bob's health
roomdata.game.players['bob'].action: what bob did last turn. if bob attacked, this will be the name of the player bob attacked
roomdata.game.players['bob'].shieldReady: true if bob can block, false if bob can't block
roomdata.game.players['bob'].availableActions: array of actions bob can make
```

### profile
Object contents are hopefully self-explanatory here. These values cover user stats across ALL games they played. Avatar is just an integer referring to an array of premade avatars.
```
profile.username
profile.wins
profile.gamesPlayed
profile.avatar
profile.successfulAttacks
profile.failedAttacks
profile.successfulBlocks
profile.failedBlocks
profile.successfulCounters
profile.failedCounters
profile.successfulHeals
profile.failedHeals
profile.totalRepairs
```
